import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    StreamType,
    VoiceConnectionStatus,
} from "@discordjs/voice";

import { Readable } from "node:stream";

class GuildMusicPlayer {
    constructor(guildId) {
        this.guildId = guildId;

        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        this.connection = null;
        this.queue = [];
        this.current = null;

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext();
        });

        this.player.on("error", (error) => {
            console.error(
                `[Music] Player error in ${this.guildId}:`,
                error
            );

            this.current = null;
            this.playNext();
        });
    }

    connect(channel) {
        if (
            this.connection &&
            this.connection.joinConfig.channelId === channel.id
        ) {
            return this.connection;
        }

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
        });

        this.connection.subscribe(this.player);

        this.connection.on(
            VoiceConnectionStatus.Disconnected,
            async () => {
                try {
                    await Promise.race([
                        new Promise((resolve) => {
                            this.connection.once(
                                VoiceConnectionStatus.Ready,
                                resolve
                            );
                        }),

                        new Promise((_, reject) => {
                            setTimeout(() => {
                                reject(
                                    new Error("Reconnect timeout")
                                );
                            }, 5000);
                        }),
                    ]);
                } catch {
                    this.destroy();
                }
            }
        );

        return this.connection;
    }

    async add(url, title, channel) {
        this.connect(channel);

        this.queue.push({
            url,
            title: title || url,
        });

        if (
            this.player.state.status === AudioPlayerStatus.Idle &&
            !this.current
        ) {
            await this.playNext();
        }
    }

    async playNext() {
        if (this.queue.length === 0) {
            this.current = null;
            return;
        }

        this.current = this.queue.shift();

        try {
            const response = await fetch(this.current.url);

            if (!response.ok || !response.body) {
                throw new Error(
                    `Unable to fetch audio: HTTP ${response.status}`
                );
            }

            const stream = Readable.fromWeb(response.body);

            const resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary,
            });

            this.player.play(resource);

            console.log(
                `[Music] Now playing "${this.current.title}" in ${this.guildId}`
            );
        } catch (error) {
            console.error(
                `[Music] Failed to play "${this.current.title}":`,
                error
            );

            this.current = null;

            await this.playNext();
        }
    }

    pause() {
        return this.player.pause();
    }

    resume() {
        return this.player.unpause();
    }

    skip() {
        if (!this.current) {
            return false;
        }

        return this.player.stop();
    }

    stop() {
        this.queue = [];
        this.current = null;
        this.player.stop();
    }

    getQueue() {
        return this.queue;
    }

    getCurrent() {
        return this.current;
    }

    getStatus() {
        return this.player.state.status;
    }

    destroy() {
        this.queue = [];
        this.current = null;

        try {
            this.player.stop();
        } catch {}

        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    }
}

class MusicManager {
    constructor() {
        this.players = new Map();
    }

    get(guildId) {
        if (!this.players.has(guildId)) {
            this.players.set(
                guildId,
                new GuildMusicPlayer(guildId)
            );
        }

        return this.players.get(guildId);
    }

    destroy(guildId) {
        const player = this.players.get(guildId);

        if (!player) {
            return;
        }

        player.destroy();
        this.players.delete(guildId);
    }
}

export default new MusicManager();