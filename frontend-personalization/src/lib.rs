use std::collections::HashMap;
use std::io::Read;

use anyhow::Result;
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::http_component;
use url::Url;

// Struct to hold the data values
struct Data {
    qr: &'static str,
    footer: &'static str,
    raffle: &'static str,
}

// Initialize the data map
fn get_data_map() -> HashMap<String, Data> {
    let mut data_map = HashMap::new();
    data_map.insert(
        "demo.fermyon.com".to_string(),
        Data {
            qr: "fermyon",
            footer: "Made with ❤️ by Fermyon and its partners",
            raffle: "possum",
        },
    );
    data_map.insert(
        "ampere.demo.fermyon.com".to_string(),
        Data {
            qr: "ampere",
            footer: "Made with ❤️ by Ampere and Fermyon",
            raffle: "zebra",
        },
    );
    data_map.insert(
        "akamai.demo.fermyon.com".to_string(),
        Data {
            qr: "akamai",
            footer: "Made with ❤️ by Akamai and Fermyon",
            raffle: "giraffe",
        },
    );
    data_map.insert(
        "azure.demo.fermyon.com".to_string(),
        Data {
            qr: "azure",
            footer: "Made with ❤️ by Azure and Fermyon",
            raffle: "gopher",
        },
    );
    data_map
}

#[http_component]
async fn handle_frontend_personalization(req: Request) -> Result<impl IntoResponse> {
    let resp: Response = spin_sdk::http::send(Request::get("/_index.html")).await?;
    // read response to string
    let mut html = String::new();
    resp.body().read_to_string(&mut html)?;

    let host = Url::parse(req.uri())?
        .host()
        .unwrap_or(url::Host::Domain(""))
        .to_string();

    let data_map = get_data_map();

    // Get data based on hostname or fall back to "demo.fermyon.com" if not found
    let default_data = data_map
        .get("demo.fermyon.com")
        .expect("Default data missing");
    let data = data_map.get(&host.to_string()).unwrap_or(default_data);

    // Replace placeholders in the HTML
    html = html.replace("{{RAFFLE_PROVIDER}}", data.qr);
    html = html.replace("{{FOOTER_CONTENT}}", data.footer);
    html = html.replace("{{RAFFLE_ANIMAL}}", data.raffle);

    let resp = resp
        .into_builder()
        .header("content-type", "text/html")
        .body(html)
        .build();

    Ok(resp)
}
