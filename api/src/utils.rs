use chrono::{Duration, Utc};
use regex::Regex;

const TODAY_FILTER: &str = "today";
const YESTERDAY_FILTER: &str = "yesterday";

// Convert a day string ("today" or "yesterday") to a date string in "YYYY-MM-DD" format
pub fn get_date_by_day_string(day_string: &str) -> Option<String> {
    let today = Utc::now().date_naive();

    match day_string {
        TODAY_FILTER => Some(today.format("%Y-%m-%d").to_string()),
        YESTERDAY_FILTER => Some((today - Duration::days(1)).format("%Y-%m-%d").to_string()),
        _ => None,
    }
}

// Convert a relative time expression like "1h" or "30min" to a timestamp string in "YYYY-MM-DD HH:MM:SS" format
pub fn get_relative_date(relative_time_expression: &str) -> Option<String> {
    let re = Regex::new(r"(\d+)([a-z]+)").unwrap();
    if let Some(captures) = re.captures(relative_time_expression) {
        let value: i64 = captures[1].parse().unwrap_or(0);
        let unit = &captures[2];
        let now = Utc::now();

        let adjusted_time = match unit {
            "h" => now - Duration::hours(value),
            "min" => now - Duration::minutes(value),
            _ => return None,
        };

        return Some(adjusted_time.format("%Y-%m-%d %H:%M:%S").to_string());
    }
    None
}
