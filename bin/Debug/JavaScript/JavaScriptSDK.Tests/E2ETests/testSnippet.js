window.appInsights = {
    config: {
        instrumentationKey: "3e6a441c-b52b-4f39-8944-f81dd6c2dc46",
        url: "ai.js",
        endpointUrl: "https://dc.services.visualstudio.com/v2/track",
        maxBatchInterval: 0,
    },
    queue: [
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        },
        function () {
            console.log('from the queue');
        }
    ]
}
var i = 100; while(i--){appInsights.queue.push(function() {window.queueTest('from the queue')})};
