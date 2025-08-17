chrome.storage.local.get(['timeSpentData'], (result) => {
    let timeSpent = result.timeSpentData || [];

    const urls = []
    const timeSpentData = []
    timeSpent.forEach(item => {
        urls.push(item.url);
        timeSpentData.push(item.timeSpent);
    });

    const [labels, dataValues] = concatSameUrls(urls, timeSpentData);
    drawChart(labels, dataValues);
});

const concatSameUrls = (labels, dataValues) => {
    let count, index;
    const arrLabels = [];
    const arrDataValues = [];

    labels.map((l, i) => {
        const withoutStart = l.split("/");
        count = 0;
        index = null;
        for (let j = 0; j < withoutStart.length && !index; j++) {
            if (withoutStart[j] == "")
                count++;
            else if (count > 0)
                index = j;
        }
        const shortUrl = withoutStart[index];
        
        if (shortUrl != "newtab") {
            const indexOfUrl = arrLabels.indexOf(shortUrl);
            if (indexOfUrl == -1) {
                arrLabels.push(shortUrl);
                arrDataValues.push(dataValues[i]);
            }
            else {
                arrDataValues[indexOfUrl] += dataValues[i];
            }
        }
    })

    return [arrLabels, arrDataValues];
}

function drawChart(labels, dataValues) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const historyChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                labels: labels,
                data: dataValues,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(37, 216, 37)',
                    'rgb(228, 64, 23)',
                    'rgb(4, 84, 84)',
                    'rgb(208, 231, 29)'
                ],
                borderColor: ['black'],
                borderWidth: 0.5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'הסטוריית השימוש באינטרנט'
                }
            }
        }
    });
}
