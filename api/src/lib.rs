use spin_sdk::http::{Request, Response, Router};
use spin_sdk::http_component;

mod api;
mod utils;

#[http_component]
fn handle_api(req: Request) -> Response {
    let mut router = Router::new();
    router.get("/api", api::get_all);
    router.get("/api/today", api::get_today);
    router.get("/api/yesterday", api::get_yesterday);
    router.get("/api/since/:time", api::get_subset_by_relative_time);
    router.handle(req)
}
