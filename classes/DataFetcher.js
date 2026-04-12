class DataFetcher {
    constructor() {
        this._accessToken = undefined;

        this.setAccessToken();
    }

    async setAccessToken() {
        const params = new URLSearchParams();

        params.append("grant_type", "client_credentials");
        /**
         * Yeah, I know this should never be just left here,
         * but I wanted to make it really cost-free (front-end only),
         * and I decided I didn't care about those keys
         */
        params.append("client_id", "bc677594d6d746989c5066c59de2314b");
        params.append("client_secret", "1f4f3d4fa360485bba4280807fbf9b27");

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        })
        
        const json = await response.json()
        
        this._accessToken = json.access_token;
    }

    /**
     * Searches for songs on Spotify
     *
     * @private
     * @param {string} name
     * @param {number} limit
     * @returns {Song[]} an array of Song objects
     */
    async getSongInfos(name, limit = 1) {
        if (this._accessToken === undefined) return {};

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${name}&type=track&limit=${limit}`,
            {
                method: "GET",
                headers: { Authorization: "Bearer " + this._accessToken },
            }
        );

        const result = await response.json();

        return result.tracks.items.map((song) => new Song(song));
    }

    /**
     * Searches for song lyrics on lrclib
     *
     * @private
     * @param {string} artistName
     * @param {string} trackName
     * @returns {object} song lyrics object
     */
    async getSongLyrics(artistName, trackName) {
        const response = await fetch(
            `https://lrclib.net/api/search?q=${artistName} ${trackName}`,
            {
                method: "GET",
            }
        );

        const result = await response.json();

        const filteredResult = result.filter(
            (data) =>
                data.trackName.toLowerCase().trim() ===
                trackName.toLowerCase().trim()
        );

        return filteredResult[0] ?? result[0] ?? null;
    }
}
