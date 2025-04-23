import app from './src/app';
import initDB from './src/db/init';

const port = process.env.API_PORT || 6969;

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
});