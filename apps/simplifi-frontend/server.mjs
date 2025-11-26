import crypto from "crypto";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import { ip } from "address";
import chalk from "chalk";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import express from "express";
import getPort, { portNumbers } from "get-port";
import morgan from "morgan";
import 'dotenv/config';

installGlobals();

const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';
const DEFAULT_PORT = Number(process.env.PORT || 5173);

const viteDevServer = IS_PROD
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
            server: { middlewareMode: true },
        }),
    );

const app = express();

const getHost = (req) => req.get("X-Forwarded-Host") ?? req.get("host") ?? "";

app.use((req, res, next) => {
    const proto = req.get("X-Forwarded-Proto");
    const host = getHost(req);
    if (proto === "http") {
        res.set("X-Forwarded-Proto", "https");
        res.redirect(`https://${host}${req.originalUrl}`);
        return;
    }
    next();
});

app.use((req, res, next) => {
    if (req.path.endsWith("/") && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
        res.redirect(301, safepath + query);
    } else {
        next();
    }
});

app.use(compression());
app.disable("x-powered-by");

if (viteDevServer) {
    app.use(viteDevServer.middlewares);
} else {
    app.use(
        "/assets",
        express.static("build/client/assets", {
            immutable: true,
            maxAge: "1y",
        }),
    );

    morgan.token("url", (req, _res) => {
        try {
            return decodeURIComponent(req.url ?? "");
        } catch (error) {
            return req.url ?? "";
        }
    });
    app.use(morgan("tiny"));
}

app.use(express.static("build/client", {
    maxAge: "1h",
}));

app.use((_, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    next();
});

app.all(
    "*",
    createRequestHandler({
        build: viteDevServer
            ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
            : await import("./build/server/index.js"),
    }),
);

async function startServer() {
    try {
        const portToUse = await getPort({
            port: portNumbers(DEFAULT_PORT, DEFAULT_PORT + 100),
        });

        const server = app.listen(portToUse, () => {
            const addy = server.address();
            const portUsed =
                DEFAULT_PORT === portToUse
                    ? DEFAULT_PORT
                    : addy && typeof addy === "object"
                        ? addy.port
                        : 0;

            if (portUsed !== DEFAULT_PORT) {
                console.warn(
                    chalk.yellow(
                        `⚠️  Port ${DEFAULT_PORT} is not available, using ${portUsed} instead.`,
                    ),
                );
            }

            console.log(`🚀 Simplifi Frontend - ${chalk.green(ENV)} mode`);
            const localUrl = `http://localhost:${portUsed}`;
            let lanUrl = null;
            const localIp = ip();

            if (
                localIp &&
                /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)
            ) {
                lanUrl = `http://${localIp}:${portUsed}`;
            }

            console.log(
                `${chalk.bold("Local:")}            ${chalk.cyan(localUrl)}
                ${lanUrl ? `${chalk.bold("On Your Network:")}  ${chalk.cyan(lanUrl)}` : ""}
                ${chalk.bold("Press Ctrl+C to stop")}
                `.trim(),
            );
        });

        closeWithGrace(async ({ err }) => {
            if (err) {
                console.error(chalk.red('Server error during shutdown:'));
                console.error(chalk.red(err));
            }

            console.log(chalk.yellow('Shutting down server gracefully...'));

            await new Promise((resolve, reject) => {
                server.close((e) => (e ? reject(e) : resolve("ok")));
            });

            if (err) {
                process.exit(1);
            }

            console.log(chalk.green('Server successfully shut down.'));
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

    } catch (error) {
        console.error(chalk.red('Failed to start server:'), error);
        process.exit(1);
    }
}

startServer();

