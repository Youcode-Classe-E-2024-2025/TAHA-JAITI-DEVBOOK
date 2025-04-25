import app from "./src/app.js";
import initDB from "./src/utils/init.js";

const port = 6969;
initDB().then(() => {
    app.listen(port, () => {
        console.log(`DevBook API server is running on http://localhost:${port}`);
    });
})