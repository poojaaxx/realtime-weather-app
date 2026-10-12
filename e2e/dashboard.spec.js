import { test, expect } from "@playwright/test";
const weather = {
  name: "Chennai",
  sys: { country: "IN" },
  main: { temp: 32, feels_like: 35, temp_min: 30, temp_max: 33, humidity: 70 },
  wind: { speed: 4 },
  coord: { lat: 13, lon: 80 },
  weather: [{ main: "Clouds", description: "scattered clouds", icon: "03d" }],
  timezone: 19800,
};
const forecast = () => ({
  city: { timezone: 19800 },
  list: Array.from({ length: 40 }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + (i + 1) * 10800,
    main: { temp_min: 25, temp_max: 33 },
    weather: [{ description: "scattered clouds", icon: "03d" }],
  })),
});
async function mockWeather(page) {
  await page.route("https://api.openweathermap.org/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/geo/"))
      return route.fulfill({
        json:
          url.searchParams.get("q") === "Invalid" ? [] : [{ lat: 13, lon: 80 }],
      });
    return route.fulfill({
      json: url.pathname.endsWith("/forecast") ? forecast() : weather,
    });
  });
  await page.route("https://openweathermap.org/img/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="25" fill="#ffdb73"/></svg>',
    }),
  );
}
test("dashboard layout, units, search and persistent history", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await mockWeather(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Five-day forecast" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Fahrenheit", exact: true }).click();
  await expect(page.getByText("90\u00b0F", { exact: true })).toBeVisible();
  await page.getByLabel("City name").fill("London");
  await page.getByLabel("City name").press("Enter");
  await expect(
    page.getByRole("button", { name: "Search again for London" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Search again for London" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Search again for London" }).click();
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await expect(
    page.getByText("Your successful city searches will appear here."),
  ).toBeVisible();
  await page.screenshot({
    path: `tmp/${info.project.name}-dashboard.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("invalid city and unavailable location provide useful fallbacks", async ({
  page,
}) => {
  await mockWeather(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: (_, failure) => failure({ code: 1 }) },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await page.getByLabel("City name").fill("Invalid");
  await page.getByLabel("City name").press("Enter");
  await expect(page.getByRole("alert")).toContainText("City not found");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("alert")).toContainText("permission was denied");
});
test("permitted location fetches weather without saving coordinates", async ({
  page,
  context,
}) => {
  await mockWeather(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 13, longitude: 80 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear history", exact: true })
    .click();
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await expect(
    page.getByText("Your successful city searches will appear here."),
  ).toBeVisible();
});
test("forecast failure preserves current conditions", async ({ page }) => {
  await mockWeather(page);
  await page.route(
    "https://api.openweathermap.org/data/2.5/forecast**",
    (route) => route.fulfill({ status: 500, json: {} }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chennai, IN" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "Current conditions are available",
  );
});
test("small mobile screen remains within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await mockWeather(page);
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Five-day forecast" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
