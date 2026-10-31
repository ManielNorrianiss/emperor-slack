import { test } from "node:test";
import assert from "node:assert/strict";
import { decider, type ConfigCanaux } from "../lib/routing.js";

const config: ConfigCanaux = {
  canaux: {
    CM2S: { client: "m2s", public: "client" },
    CINT: { public: "equipe" },
    CMAUVAIS: { client: "../secret", public: "client" },
  },
};

test("canal client : version client seulement, même pour un membre de GRO", () => {
  for (const estMembreGro of [true, false]) {
    assert.deepEqual(decider(config, { canal: "CM2S", typeCanal: "channel", estMembreGro }), {
      action: "repondre",
      public: "client",
      client: "m2s",
    });
  }
});

test("canal interne : équipe seulement pour un membre de GRO", () => {
  assert.equal(decider(config, { canal: "CINT", typeCanal: "channel", estMembreGro: true }).action, "repondre");
  assert.equal(decider(config, { canal: "CINT", typeCanal: "channel", estMembreGro: false }).action, "refuser");
});

test("message privé : refusé à une personne externe", () => {
  assert.equal(decider(config, { canal: "D1", typeCanal: "im", estMembreGro: false }).action, "refuser");
  assert.deepEqual(decider(config, { canal: "D1", typeCanal: "im", estMembreGro: true }), {
    action: "repondre",
    public: "equipe",
  });
});

test("canal inconnu : ignoré", () => {
  assert.deepEqual(decider(config, { canal: "CAUTRE", typeCanal: "channel", estMembreGro: true }), { action: "ignorer" });
});

test("nom de client invalide (chemin) : ignoré", () => {
  assert.deepEqual(decider(config, { canal: "CMAUVAIS", typeCanal: "channel", estMembreGro: true }), { action: "ignorer" });
});
