
document.addEventListener('DOMContentLoaded', () => {
    requestData("all")
    const timeRangeElement = document.getElementById("timeRange");
    timeRangeElement.addEventListener('change', () => {
        requestData(timeRangeElement.value);
    }, false);

}, false);

const getUrl = (range) => {
    if (!range || range === "all") {
        return `${window.location.origin}/api/`;
    }
    return `${window.location.origin}/api/${range}`;
}
const requestData = (range) => {
    const url = getUrl(range);
    // Mock API response
    fetch(url).then(data => { return data.json() })
        .then(data => {
            console.log(data)

            // Sort the data by timestamp
            data.sort(function (a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp)
            })

            // Group data by source
            const groupedData = data.reduce((acc, curr) => {
                if (!acc[curr.source]) {
                    acc[curr.source] = [];
                }
                acc[curr.source].push({
                    t: new Date(curr.timestamp),
                    y: curr.volume
                });
                return acc;
            }, {});

            // Color options for each source
            const colors = [
                'rgb(0, 255, 255)',  // Electric Blue
                'rgb(255, 255, 0)',  // Bright Yellow
                'rgb(57, 255, 20)',  // Neon Green
                'rgb(255, 105, 180)',  // Hot Pink
                'rgb(191, 0, 255)',  // Electric Purple
                'rgb(255, 165, 0)',  // Bright Orange
                'rgb(0, 191, 255)',  // Cyan
                'rgb(0, 255, 0)',  // Lime
                'rgb(255, 69, 0)',  // Bright Red
                'rgb(64, 224, 208)'  // Turquoise
            ];

            // Create the chart datasets
            const datasets = Object.keys(groupedData).map((source, index) => {
                color = colors[index % colors.length];
                return {
                    label: `Source ${source}`,
                    data: groupedData[source],
                    // backgroundColor: `rgba(${color}, 0.2)`,
                    borderColor: color,
                    borderWidth: 1
                };
            });

            // Create the chart
            var ctx = document.getElementById("volumeChart").getContext("2d");

            var myChart = new Chart(ctx, {
                type: 'line',
                options: {
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'minute',
                                displayFormats: {
                                    'minute': 'MMM DD, HH:mm:ss'
                                }
                            }
                        }]
                    }
                },
                data: {
                    datasets: datasets
                }
            });
        });
}