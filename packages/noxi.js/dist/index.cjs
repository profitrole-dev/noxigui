"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@noxigui/runtime");
const Noxi = {
    gui: {
        create(xml, renderer) {
            return runtime_1.RuntimeInstance.create(xml, renderer);
        }
    }
};
exports.default = Noxi;
