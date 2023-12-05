import { env } from './env';
import { app } from './app'


app.listen({
	port: env.PORT,

}).then(() => {
	console.log("🚀Running on localhost:3333");
});