use anyhow::{Context, Result};
use serde::Serialize;
use spin_sdk::http::Params;
use spin_sdk::http::{IntoResponse, Request, Response};
use spin_sdk::sqlite::Connection;

// SQL statements
const SQL_SELECT_ALL: &str = "SELECT * FROM noise_log";
const SQL_SELECT_SUBSET: &str = "SELECT * FROM noise_log WHERE DATETIME(noise_log.timestamp) > ?";
const SQL_SELECT_SUBSET_BY_DAY: &str =
    "SELECT * FROM noise_log WHERE DATE(noise_log.timestamp) = ?";

// Struct for NoiseLogItem
#[derive(Serialize)]
struct NoiseLogItem {
    source: String,
    volume: u32,
    timestamp: String,
}

// Handler functions
pub fn get_all(_req: Request, _params: Params) -> Result<impl IntoResponse> {
    let conn = Connection::open_default()?;
    let rowset = conn
        .execute(SQL_SELECT_ALL, [].as_slice())
        .context("failed to insert entry into noise_log")?;
    let items: Vec<NoiseLogItem> = rowset
        .rows()
        .map(|row| NoiseLogItem {
            source: row.get::<&str>("source").unwrap().to_string(),
            volume: row.get::<u32>("volume").unwrap(),
            timestamp: row.get::<&str>("timestamp").unwrap().to_owned(),
        })
        .collect();

    let body = serde_json::to_vec(&items)?;
    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(body)
        .build())
}

pub fn get_today(req: Request, _params: Params) -> Result<impl IntoResponse> {
    get_subset_by_day(req, "today")
}

pub fn get_yesterday(req: Request, _params: Params) -> Result<impl IntoResponse> {
    get_subset_by_day(req, "yesterday")
}

fn get_subset_by_day(_req: Request, day: &str) -> Result<impl IntoResponse> {
    let Some(day) = crate::utils::get_date_by_day_string(day) else {
        return Ok(Response::builder().status(400).build());
    };
    let query = SQL_SELECT_SUBSET_BY_DAY.replace('?', &format!("\'{day}\'"));
    let conn = Connection::open_default()?;
    let rowset = conn
        .execute(&query, [].as_slice())
        .context("failed to insert entry into noise_log")?;
    let items: Vec<NoiseLogItem> = rowset
        .rows()
        .map(|row| NoiseLogItem {
            source: row.get::<&str>("source").unwrap().to_string(),
            volume: row.get::<u32>("volume").unwrap(),
            timestamp: row.get::<&str>("timestamp").unwrap().to_owned(),
        })
        .collect();

    let body = serde_json::to_vec(&items)?;
    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(body)
        .build())
}

pub fn get_subset_by_relative_time(_req: Request, params: Params) -> Result<impl IntoResponse> {
    let relative_time_expression = params.get("time").context("missing time parameter")?;
    let Some(time) = crate::utils::get_relative_date(relative_time_expression) else {
        return Ok(Response::builder().status(400).build());
    };
    let query = SQL_SELECT_SUBSET.replace('?', &format!("\'{time}\'"));
    let conn = Connection::open_default()?;
    let rowset = conn
        .execute(&query, [].as_slice())
        .context("failed to insert entry into noise_log")?;
    let items: Vec<NoiseLogItem> = rowset
        .rows()
        .map(|row| NoiseLogItem {
            source: row.get::<&str>("source").unwrap().to_string(),
            volume: row.get::<u32>("volume").unwrap(),
            timestamp: row.get::<&str>("timestamp").unwrap().to_owned(),
        })
        .collect();

    let body = serde_json::to_vec(&items)?;
    Ok(Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(body)
        .build())
}
