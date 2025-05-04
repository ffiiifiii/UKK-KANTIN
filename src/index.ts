import express, { Request, Response } from "express"
import routeSiswa from "./route/siswaRoute";
import routeMenu from "./route/menuRoute";
import routeStan from "./route/stanRoute";
import routeDiskon from "./route/diskonRouter";
import routeUsers from "./route/usersRoute";
import routeTransaksi from "./route/transaksiRoute";
import routeMenuDiskon from "./route/menuDiskonRoute"

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8000;

app.use(routeSiswa)
app.use(routeMenu)
app.use(routeStan)
app.use(routeDiskon)
app.use(routeTransaksi)
app.use(routeUsers)
app.use(routeMenuDiskon)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app