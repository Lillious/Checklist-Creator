import Cleanup from "./cleanup.js";
import path from "path";

Cleanup(path.join(process.cwd(), 'dist'))
.catch((err) => {
    throw new Error(err);
});