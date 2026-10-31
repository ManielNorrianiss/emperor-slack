import { test } from "node:test";
import assert from "node:assert/strict";
import { decider, detecterClients, type ConfigCanaux, type ConfigClients } from "../lib/routing.js";

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

test("canal interne dédié à un client : équipe, ce client seulement", () => {
  const cfg: ConfigCanaux = { canaux: { CDED: { client: "m2s", public: "equipe" } } };
  assert.deepEqual(decider(cfg, { canal: "CDED", typeCanal: "channel", estMembreGro: true }), {
    action: "repondre",
    public: "equipe",
    client: "m2s",
  });
  assert.equal(decider(cfg, { canal: "CDED", typeCanal: "channel", estMembreGro: false }).action, "refuser");
});

const clients: ConfigClients = {
  clients: {
    m2s: { nom: "Groupe M2S", alias: ["m2s"] },
    bgc: { nom: "Gestion BGC", alias: ["bgc"] },
    "groupe-module": { nom: "Groupe Module Constructions", alias: ["module"] },
  },
};

test("détection du client nommé dans la question", () => {
  assert.deepEqual(detecterClients(clients, "Comment on approuve une facture chez M2S ?"), ["m2s"]);
  assert.deepEqual(detecterClients(clients, "chez bgc et chez Module, c'est pareil ?"), ["bgc", "groupe-module"]);
  assert.deepEqual(detecterClients(clients, "Gestion BGC : les extras ?"), ["bgc"]);
});

test("détection : pas de faux positif sur un bout de mot", () => {
  assert.deepEqual(detecterClients(clients, "la modulation des prix"), []);
  assert.deepEqual(detecterClients(clients, "comment ça marche ?"), []);
});
