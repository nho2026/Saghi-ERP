import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInstance } from "i18next";
const locales = Object.fromEntries(
  ["en", "ar", "ku"].map((language) => [
    language,
    JSON.parse(
      readFileSync(
        new URL(`../../locale/${language}.json`, import.meta.url),
        "utf8",
      ),
    ),
  ]),
);
const buildingLocales = Object.fromEntries(
  Object.entries(locales).map(([language, locale]) => [
    language,
    locale.buildingExpenses,
  ]),
);
import ts from "typescript";

test("every sidebar label resolves through the default namespace, including multiword labels", async () => {
  const navigation = readFileSync(
    new URL("building-navigation.ts", import.meta.url),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("../../app/layouts/DashboardLayout.tsx", import.meta.url),
    "utf8",
  );
  const keys = new Set([
    "buildingExpenses.title",
    "buildingExpenses.description",
    ...Array.from(
      navigation.matchAll(/label:\s*"([^"]+)"/g),
      (match) => match[1],
    ),
    ...Array.from(
      sidebar.matchAll(/t\("(buildingExpenses\.[^"]+)"/g),
      (match) => match[1],
    ),
  ]);
  const i18n = createInstance();
  await i18n.init({
    lng: "en",
    fallbackLng: "en",
    resources: Object.fromEntries(
      Object.entries(locales).map(([language, translation]) => [
        language,
        { translation, building: translation.buildingExpenses },
      ]),
    ),
  });
  for (const language of ["ku", "ar", "en"]) {
    await i18n.changeLanguage(language);
    for (const key of keys) {
      const expected = key
        .split(".")
        .reduce((value, part) => value?.[part], locales[language]);
      assert.equal(typeof expected, "string", key);
      assert.equal(i18n.t(key), expected, `${language}: ${key}`);
      assert.notEqual(i18n.t(key), key);
      // Dashboard quick links use the module namespace instead of the sidebar's default namespace.
      assert.equal(
        i18n.getFixedT(null, "building")(
          key.replace(/^buildingExpenses\./, ""),
          { keySeparator: ".", nsSeparator: false },
        ),
        expected,
      );
    }
  }
  assert.ok(!navigation.includes("building:"));
  assert.ok(!sidebar.includes("building:"));
});

test("dynamic dialog titles and metadata are covered, with no raw UI text", () => {
  const check = (key) => {
    for (const language of ["en", "ar", "ku"])
      assert.ok(
        key.startsWith("buildingExpenses.")
          ? key
              .split(".")
              .reduce((value, part) => value?.[part], locales[language])
          : buildingLocales[language][key.replace(/^building:/, "")],
        `${language}: ${key}`,
      );
  };
  for (const file of [
    "BuildingExpensesPage.tsx",
    "BuildingDashboardPage.tsx",
    "BuildingStatusBadge.tsx",
    "building-navigation.ts",
  ]) {
    const source = ts.createSourceFile(
      file,
      readFileSync(new URL(file, import.meta.url), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const branches = (node) => {
      if (!node) return;
      if (ts.isStringLiteral(node)) check(node.text);
      if (ts.isConditionalExpression(node)) {
        branches(node.whenTrue);
        branches(node.whenFalse);
      }
    };
    const visit = (node) => {
      if (ts.isCallExpression(node) && node.expression.getText(source) === "t")
        branches(node.arguments[0]);
      if (
        ts.isPropertyAssignment(node) &&
        ["label", "note"].includes(node.name.getText(source)) &&
        ts.isStringLiteral(node.initializer) &&
        node.initializer.text
      )
        check(node.initializer.text);
      if (ts.isJsxText(node))
        assert.ok(
          !/[A-Za-z]/.test(node.text),
          `${file}: raw text ${node.text.trim()}`,
        );
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
});

test("complete phrases and errors update when the active language changes", async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: "en",
    resources: Object.fromEntries(
      Object.entries(buildingLocales).map(([language, building]) => [
        language,
        { building },
      ]),
    ),
  });
  const t = i18n.getFixedT(null, "building");
  for (const language of ["ku", "ar", "en"]) {
    await i18n.changeLanguage(language);
    for (const key of [
      "New request",
      "Add product",
      "Submitted for approval",
      "Close",
      "Check required fields and entered values.",
    ]) {
      assert.equal(
        t(key, { nsSeparator: false, keySeparator: false }),
        buildingLocales[language][key],
      );
    }
    assert.ok(
      !t("Payment of {{amount}} by {{method}}", {
        nsSeparator: false,
        keySeparator: false,
        amount: 25,
        method: t("cash"),
      }).includes("{{"),
    );
  }
});

test("all module translation keys have Arabic and Kurdish translations", () => {
  for (const file of [
    "BuildingExpensesPage.tsx",
    "BuildingDashboardPage.tsx",
    "BuildingStatusBadge.tsx",
  ]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    for (const [, key] of source.matchAll(/\bt\("([^"\n]+)"/g)) {
      for (const language of ["en", "ar", "ku"])
        assert.ok(buildingLocales[language][key], `${language}: ${key}`);
    }
  }
  for (const language of ["ar", "ku"]) {
    for (const key of Object.keys(buildingLocales.en).filter(
      (key) => typeof buildingLocales.en[key] === "string",
    )) {
      assert.ok(buildingLocales[language][key], `${language}: ${key}`);
      if (key.replace(/{{[^}]+}}/g, "").trim())
        assert.notEqual(
          buildingLocales[language][key],
          key,
          `${language}: untranslated ${key}`,
        );
    }
  }
});
test("localized sidebar labels, punctuation and interpolated statuses resolve", async () => {
  for (const language of ["ar", "ku"]) {
    const i18n = createInstance();
    await i18n.init({
      lng: language,
      resources: { [language]: { building: buildingLocales[language] } },
    });
    assert.equal(
      i18n.t("building:Products"),
      buildingLocales[language].Products,
    );
    assert.equal(
      i18n.t("Total:", {
        ns: "building",
        nsSeparator: false,
        keySeparator: false,
      }),
      buildingLocales[language]["Total:"],
    );
    const status = buildingLocales[language].approved;
    const text = i18n.t("Change status to {{status}}", {
      ns: "building",
      nsSeparator: false,
      keySeparator: false,
      status,
    });
    assert.ok(text.includes(status));
    assert.ok(!text.includes("{{"));
  }
});
