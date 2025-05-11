import { MulmoMediaSource } from "../types/index.js";

export const MulmoMediaSourceMethods = {
  async getText(mediaSource: MulmoMediaSource) {
    if (mediaSource.kind === "text") {
      return mediaSource.text;
    }
    if (mediaSource.kind === "url") {
      const res = await fetch(mediaSource.url);
      if (res.ok) {
        return await res.text();
      } else {
        throw new Error(`Failed to fetch media source: ${mediaSource.url}`);
      }
    }
    return null;
  },
};
