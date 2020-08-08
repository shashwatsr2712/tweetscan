$(document).ready(function(){
    
    // Right border between India and global trends
    $("#indiaTrendsCol").css("border-right","2px dashed #000000");
    if($(window).width()<=576){
        let elem_h=$("#indiaTrendsCol");
        // Remove the right border and insert <hr> for mobile devices 
        $('<hr style="width:100%;border:2px solid #00000;"/>').insertAfter(elem_h);
        $("#indiaTrendsCol").prop("style").removeProperty("border-right");
    }

    // Trend analyis in India 
    $("#loadIndiaTrends").click(function(){
        let clicked_button=$(this);
        clicked_button.toggleClass("btn-secondary");
        let prev_text1=clicked_button.text();
        clicked_button.text("Loading...");
        clicked_button.attr("disabled","disabled");
        $.ajax({
            type: 'post',
            url: '/analyzeIndiaTrends',
            dataType: 'json'
        })
        .done(function(arr_data_received){
            // We get the classified result (for each trend) of sentiments here
            // Just draw a chart for it
            $("#indiaTrendsDiv").empty();
            clicked_button.toggleClass("btn-secondary");
            clicked_button.removeAttr("disabled");
            clicked_button.text(prev_text1);
            arr_data_received.forEach(function(data_received,index){
                if(data_received.error!=undefined){
                    let new_alert=`<div id="apiError" class="alert alert-danger">
                        ${data_received.error}
                    </div>`;
                    $("#indiaTrendsDiv").append(new_alert);
                } else{
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(function(){
                        let chart_data = google.visualization.arrayToDataTable([
                            ['Sentiment', 'Number of tweets'],
                            ['Positive', data_received.Positive],
                            ['Negative', data_received.Negative],
                            ['Neutral', data_received.Neutral]
                        ]);
                        let parent_elem=$("#indiaTrendsDiv");
                        let options = {
                            'title': 'Trend: '+data_received.Query,
                            'is3D': true,
                            'legend': 'top',
                            'height': 500,
                            'backgroundColor': {
                                'fill': '#97c4d6'
                            }
                        }
                        let new_elem=`<div id="indiaTrendsChart${index}"></div>`
                        parent_elem.append(new_elem);
                        let chart = new google.visualization.PieChart(document.getElementById("indiaTrendsChart"+index));
                        chart.draw(chart_data, options);
                    });
                } 
            });
        });
    });
    
    // Trend analysis globally
    $("#loadWorldTrends").click(function(){
        let clicked_button=$(this);
        clicked_button.toggleClass("btn-secondary");
        let prev_text2=clicked_button.text();
        clicked_button.text("Loading...");
        clicked_button.attr("disabled","disabled");
        $.ajax({
            type: 'post',
            url: '/analyzeWorldTrends',
            dataType: 'json'
        })
        .done(function(arr_data_received){
            // We get the classified result (for each trend) of sentiments here
            // Just draw a chart for it
            $("#worldTrendsDiv").empty();
            clicked_button.toggleClass("btn-secondary");
            clicked_button.removeAttr("disabled");
            clicked_button.text(prev_text2);
            arr_data_received.forEach(function(data_received,index){
                if(data_received.error!=undefined){
                    let new_alert=`<div id="apiError" class="alert alert-danger">
                        ${data_received.error}
                    </div>`;
                    $("#worldTrendsDiv").append(new_alert);
                } else{
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(function(){
                        let chart_data = google.visualization.arrayToDataTable([
                            ['Sentiment', 'Number of tweets'],
                            ['Positive', data_received.Positive],
                            ['Negative', data_received.Negative],
                            ['Neutral', data_received.Neutral]
                        ]);
                        let parent_elem=$("#worldTrendsDiv");
                        let options = {
                            'title': 'Trend: '+data_received.Query,
                            'is3D': true,
                            'legend': 'top',
                            'height': 500,
                            'backgroundColor': {
                                'fill': '#97c4d6'
                            }
                        };
                        let new_elem=`<div id="worldTrendsChart${index}"></div>`
                        parent_elem.append(new_elem);
                        let chart = new google.visualization.PieChart(document.getElementById("worldTrendsChart"+index));
                        chart.draw(chart_data, options);
                    });
                } 
            });
        });
    });

    // Keyword/HashTag analysis
    $("#searchHashTag").submit(function(event){
        event.preventDefault();
        let submit_button=$(this).find("button"); // Form submit button
        submit_button.toggleClass("btn-secondary");
        let prev_text=submit_button.text();
        submit_button.text("Loading...");
        submit_button.attr("disabled","disabled");

        data={}; // To be sent in AJAX request
        data.search=$(this).find("input#searchQuery").val(); // The searched term
        console.log(data);
        $.ajax({
            type: 'post',
            url: '/analyzeHashTag',
            data: data,
            dataType: 'json'
        })
        .done(function(data_received){
            submit_button.toggleClass("btn-secondary");
            submit_button.removeAttr("disabled");
            submit_button.text(prev_text);
            // We get the classified result of sentiments here
            // Just draw a chart for it
            if(data_received.error!=undefined){
                let new_alert=`<div id="apiError" class="alert alert-danger">
                    ${data_received.error}
                </div>`;
                $("#searchHashTag").append(new_alert);
                setTimeout(function(){
                    $("#apiError").remove();
                },3000);
            } else{
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(function(){
                    let chart_data = google.visualization.arrayToDataTable([
                        ['Sentiment', 'Number of tweets'],
                        ['Positive', data_received.Positive],
                        ['Negative', data_received.Negative],
                        ['Neutral', data_received.Neutral]
                    ]);
                    let options = {
                        'title': 'Keyword: '+data.search,
                        'legend': 'top',
                        'is3D': true,
                        'height': 500
                    };
                    let chart = new google.visualization.PieChart(document.getElementById("piechart"));
                    chart.draw(chart_data, options);
                });
            }
        });
    });
});