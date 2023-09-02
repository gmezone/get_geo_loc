import express from "express";
import fetch from 'node-fetch';
import { SuperfaceClient } from "@superfaceai/one-sdk";

const app = express();
const PORT = 8080;

app.set("trust proxy", true);

const sdk = new SuperfaceClient();

async function getGeoLocation(retries = 3) {
    const url = "https://ipinfo.io/json";
    try {
        const response = await fetch(url, {
            method: 'GET'
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Error fetching geolocation:", error);
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)`);
            return getGeoLocation(retries - 1);
        } else {
            throw new Error("Failed to fetch geolocation after multiple attempts.");
        }
    }
}

async function run(ip) {
    // Load the profile
    const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

    // Use the profile
    const result = await profile.getUseCase("IpGeolocation").perform(
        {
            ipAddress: ip
        },
        {
            provider: "ipdata",
            security: {
                apikey: {
                    apikey: "9a511b6fc8334e1852cfbbd4ff3f1af3c42ed6abc75e96a1648b969a"
                }
            }
        }
    );

    // Handle the result
    try {
        const data = result.unwrap();
        return data;
    } catch (error) {
        console.error(error);
    }
}

app.get("/", async (req, res) => {
    try {
        const loc = await getGeoLocation();
        console.log("loc", loc);
        res.send(loc);
    } catch (error) {
        console.error("Error in endpoint:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
