import { generateReducer } from "../redux/generate_reducer";
import { TickerState } from "./interfaces";
import { ReduxAction } from "../redux/interfaces";
import { RpcBotLog } from "../devices/interfaces";
import * as i18next from "i18next";
import { store } from "../redux/store";
import { get } from "lodash";

let YELLOW = "#fd6",
    RED = "#e66",
    GREEN = "#6a4",
    BLUE = "#4286f4",
    ORANGE = "#e93",
    PURPLE = "#C68ED2";

function firstPerson(color: string, m: string, show = true) {
    return function (s: TickerState, a: ReduxAction<{}>) {
        // TODO: HACK: This is such a hack, but I can't think of a
        // faster way to get it done and it's not a very critical part of the
        // system. PRs welcome. Help appreciated. In the meantime, #shipIt
        let name = get<string>(store.getState(), "bot.account.name", "Bot");
        let message = i18next.t(`{{name}} is {{message}}`,
            { name, message: m });
        return { color, message, show };
    };
}

function change(color: string, message: string, show = true) {
    return function (s: TickerState, a: ReduxAction<{}>) {
        message = i18next.t(message);
        return { color, message, show };
    };
}
let initialState = {
    message: "Please log in",
    color: "gray",
    show: true
};

export let tickerReducer = generateReducer<TickerState>(initialState)
    .add<{}>("LOGIN_OK", (s, a) => {
        return { color: RED, message: "Logged in", show: true };
    })
    .add<{}>("LOGIN_ERR", change(RED, "Bad login"))
    .add<{}>("FETCH_PLANTS_START", firstPerson(YELLOW, "fetching plants."))
    .add<{}>("FETCH_PLANTS_OK", firstPerson(GREEN, "done fetching plants"))
    .add<{}>("FETCH_PLANTS_ERR", firstPerson(RED, "unable to fetch plants."))
    .add<{}>("FETCH_SEQUENCES_OK",
    firstPerson(GREEN, "done fetching sequences."))
    .add<{}>("FETCH_DEVICE_ERR", change(RED, "Can't connect to MQTT server"))
    .add<{}>("BOT_SYNC_OK", firstPerson(GREEN, "synced"))
    .add<RpcBotLog>("BOT_LOG", (s, a) => {
        let message = a.payload.message;
        switch (a.payload.meta.type) {
            case "success":
                return { color: GREEN, message: message, show: true };
            case "busy":
                return { color: YELLOW, message: message, show: true };
            case "warn":
                return { color: ORANGE, message: message, show: true };
            case "error":
                return { color: RED, message: message, show: true };
            case "info":
                return { color: BLUE, message: message, show: true };
            case "fun":
                return { color: PURPLE, message: message, show: true };
        }
    });
