import { ResponseBuilder } from "@fermyon/spin-sdk";

const data = {
    "demo.fermyon.com": {
        qr: "fermyon",
        footer: "Made with ❤️ by Fermyon and its partners",
        raffle: "possum"
    },
    "ampere.demo.fermyon.com": {
        qr: "ampere",
        footer: "Made with ❤️ by Ampere and Fermyon",
        raffle: "zebra"
    },
    "akamai.demo.fermyon.com": {
        qr: "akamai",
        footer: "Made with ❤️ by Akamai and Fermyon",
        raffle: "giraffe"
    },
    "azure.demo.fermyon.com": {
        qr: "azure",
        footer: "Made with ❤️ by Azure and Fermyon",
        raffle: "gopher"
    },
}

export async function handler(req: Request, res: ResponseBuilder) {
    let url = new URL(req.url)
    console.log(url.hostname)
    let resp = await fetch("http://frontend.spin.internal/index.html")

    let html = await resp.text()
    //@ts-ignore
    let qr = data[url.hostname]?.qr || "fermyon"
    //@ts-ignore
    let footer = data[url.hostname]?.footer || data["demo.fermyon.com"].footer
    //@ts-ignore
    let raffle = data[url.hostname]?.raffle || data["demo.fermyon.com"].raffle

    //@ts-ignore
    html = html.replace("{{RAFFLE_PROVIDER}}", qr)
    html = html.replace("{{FOOTER_CONTENT}}", footer)
    html = html.replace("{{RAFFLE_ANIMAL}}", raffle)

    res.set("content-type", "text/html")
    res.send(html)
}
