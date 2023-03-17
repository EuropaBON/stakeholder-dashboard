/*****************************************************************************
*                      GLOBAL VARIABLES
******************************************************************************/

export const cy = cytoscape({ container: document.getElementById('europabon-network')}),
            groups = [10000,10001,10002,10003,10004,10005],
            TOTAL_EVENTS = '13',
            NO_DATA = 'N.A.',
            scatter_data_degree = [],
            scatter_data_eigen = [],
            bplot_data_degree = [],
            bplot_data_eigen = [];

let group_series = [
    {
        name: "Academia",
        color: 'rgba(0, 128, 2, 1)'
    },
    {
        name: "Non-Governmental Organization",
        color: 'rgba(255, 165, 0, 1)'
    },
    {
        name: "Governmental Organization",
        color: 'rgba(255, 0, 0, 1)'
    },
    {
        name: "Private Industry",
        color: 'rgba(0, 4, 255, 1)'
    },
    {
        name: "Citizen Science",
        color: 'rgba(255, 255, 0, 1)'
    },
    {
        name: "Other",
        color: 'rgba(128, 1, 128, 1)'
    }
];



/*****************************************************************************
*                      GLOBAL FUNCTIONS
******************************************************************************/

// HTML for Tooltip
export const htmlTitle = function (html) {
    const container = document.createElement("div");
    container.innerHTML = html;
    return container;
}

// Object with counts of items
export const objNums = function (input,output) {
    return input.reduce((a, b) => (b in a ? a[b]++ : a[b] = 1, a), output);
}

// sort Object
export const sortObject = function (object){
    return Object.fromEntries(Object.entries(object).sort(([,a],[,b]) => b-a));
}


// get Percentile from an array
export const getPercentile = function (data, percentile) {
    data.sort(numSort);
    const index = (percentile/100) * data.length;
    let result;
    if (Math.floor(index) == index) {
        result = (data[(index-1)] + data[index])/2;
    }
    else {
        result = data[Math.floor(index)];
    }
    return Number(result.toFixed(3));
}
  
// because .sort() doesn't sort numbers correctly
export const numSort = function (a,b) { 
    return a - b; 
}
  
// get BOX PLOT Values
export const getBoxValues = function (data) {
    const boxValues = [[]];
    boxValues[0][0] = Math.min(...data);
    boxValues[0][1] = getPercentile(data, 25);
    boxValues[0][2] = getPercentile(data, 50);
    boxValues[0][3] = getPercentile(data, 75);
    boxValues[0][4] = Number(Math.max(...data).toFixed(3));
    return boxValues;
}

// create HTML table based on object
export const topRanking = function (object,tableID) {
    let nbr = 1;
    Object.entries(object).forEach(([key, value], index) => {
        if (index <= 9) {
            $(`#${tableID}`).append(`
                <tr>
                ${(tableID === 'topCentrality') ? '<td>'+nbr+'</td>' : ''}
                <td>${key.replace(/[_-]/g, " ").toUpperCase()}</td>
                <td><b>${value}</b></td>
                </tr>`
            );
        }
        nbr++;
    })
}

export const saveAsImage = function (){
    var b64 = cy.jpg({
        output: 'blob',
        bg: '#fff',
        maxWidth: 5000,
        quality: 1
    });
    saveAs(b64, 'europabon-network-graph.jpg');
}

// capitalize 
export const capitalizeFirst = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Calculate degree centrality
export const degreeCentrality = function (id) {
    return cy.$().dc({ root: `#${id}`}).degree;
}

// calculate page rank (=Eigenvector centrality)
export const pageRank = function (id) {
    return Number(cy.elements().pageRank().rank(`#${id}`)).toFixed(5);
}

// Object degree Centrality 
export const degreeObject = function (data) {
    let obj = {};
    $.each(data, (index, {id,label,occupation}) => {
        if (occupation) obj[label] = degreeCentrality(id);
    });
    return obj;
}

// Object Eigenvector Centrality
export const eigenObject = function (data) {
    let obj = {};
    $.each(data, (index, {id,label,occupation}) => {
        if (occupation) obj[label] = pageRank(id);
    });
    return obj;
}

// toggle Groups by class name
export const toggleGroups = function (className) {
    let elements = document.querySelectorAll(className);
    elements.forEach((element) => {
        element.addEventListener("click", function(){
            if (!this.dataset.clicked){
                this.setAttribute("data-clicked", "true");
                cy.$(`node[type="${this.getAttribute('value')}"]`).css('visibility','hidden');
                cy.$(`node[type="${this.getAttribute('value')}"]`).connectedEdges().css('visibility','hidden');
                this.style.color = "#CCC";
            } else {
                this.removeAttribute("data-clicked");
                cy.$(`node[type="${this.getAttribute('value')}"]`).css('visibility','visible');
                cy.$(`node[type="${this.getAttribute('value')}"]`).connectedEdges().css('visibility','visible');
                this.style.color = "#555";
            }
        });
    })
}



// populate chart data
export const chartData = function (data){

    function regression(arrEvents, arrCentrality) {
        let r, sy, sx, b, a, meanX, meanY;
    
        r = jStat.corrcoeff(arrCentrality, arrEvents);
        sy = jStat.stdev(arrEvents);
        sx = jStat.stdev(arrCentrality);
        meanY = jStat(arrEvents).mean();
        meanX = jStat(arrCentrality).mean();
        b = r * (sy / sx);
        a = meanY - meanX * b;
        //Set up a line
        let y1, y2, x1, x2;
        x1 = jStat.min(arrCentrality);
        x2 = jStat.max(arrCentrality);
        y1 = a + b * x1;
        y2 = a + b * x2;
        return {
          line: [
            [Number(x1.toFixed(3)), Number(y1.toFixed(3))],
            [Number(x2.toFixed(3)), Number(y2.toFixed(3))]
          ],
          r
        };
      }

    const getGroups = (groupName,centrality) => {
        let temp = [],
            tempEvents = [],
            tempCentrality = [];
        data.forEach((elm) => {
          if (elm.occupation == groupName) {

            if(centrality === "degree") {
                let degree = degreeCentrality(elm.id);
                temp.push([degree, Number(elm.events.total)]);
                tempCentrality.push(degree);
            } else {
                let eigen = pageRank(elm.id)*10;
                temp.push([eigen, Number(elm.events.total)]);
                tempCentrality.push(eigen);
            }
            tempEvents.push(Number(elm.events.total));
          }
        });
        let { line, r } = regression(tempEvents, tempCentrality);
        return [temp, line, r, tempCentrality];
    };

      

    group_series.forEach((e) => {
        let names = ['degree','eigen'];
        names.forEach((name) => {
            let [scatterData, line, r, tempCentrality] = getGroups(e.name,name);
            let scatter = {
                type: "scatter",
                visible: false,
                name: e.name,
                data: scatterData,
                color: e.color
            };
            let linedata = {
                name: e.name,
                visible: true,
                r: Number(r.toFixed(3)),
                data: line,
                color: e.color
            }
            let boxplot = {
                name: e.name,
                data: getBoxValues(tempCentrality),
                color: e.color
            };
            if (name === 'degree') { 
                scatter_data_degree.push(scatter,linedata);
                bplot_data_degree.push(boxplot);
            } else { 
                scatter_data_eigen.push(scatter,linedata);
                bplot_data_eigen.push(boxplot);
            };
        })
    });


}




// populate the data table with JSON data
export const populateDataTable = function (data) {

    // clear the table before populating it with more data
    $("#dataTable").DataTable({
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        // "dom": 'Bfrtip',
        // "buttons": [
        //     {
        //       extend: "excelHtml5",
        //       text: "<i class=\"fa fa-file-excel-o\"></i> Export list as Excel"
        // }],
        "language": {
            "info": "Showing _START_ to _END_ of _TOTAL_ nodes",
            "infoFiltered": "(filtered from _MAX_ total nodes)",
            "lengthMenu": "Show _MENU_ nodes",
            "search": ""
        }}).clear();
    // custom input search
    $('.dataTables_filter input[type="search"]').attr('placeholder','Search...').css({'width': '400px','height': '60px','padding': '20px'});

    let Lgroup, LgroupBtn, badgeClass, LeventsLevel, LeventsLevelBtn, LeventsTotalBtn, Lcolor, dc, ec, size;
    
    $.each(data, (index, {id, group, label, occupation, country, realm, eu_region, events}) => {
        //if (!groups.includes(id)) {

            badgeClass = false;

            switch (group) {
            case 'datauser':
                Lgroup = "Data user";
                break;
            case 'dataprovider':
                Lgroup = "Data provider";
                break;
            case 'datauser_provider':
                Lgroup = "Data user / provider";
                break;
            case NO_DATA:
                Lgroup = NO_DATA;
                badgeClass = true;
                break;
            }

            if (events){
            switch (events.level) {
                case '0':
                    LeventsLevel = 'None';
                    Lcolor = 'danger';
                    size = '20';
                    break;
                case '1':
                    LeventsLevel = 'Low';
                    Lcolor = 'warning';
                    size = '40';
                    break;
                case '2':
                    LeventsLevel = 'High';
                    Lcolor = 'success';
                    size = '80';
                    break;
                }
            }

            if ( group !== NO_DATA ) {
                dc = degreeCentrality(id);
                cy.$(`#${id}`).css("width", size);
                cy.$(`#${id}`).css("height", size);
            } else {
                dc = '-';
            };
            ec = ( group !== NO_DATA ) ? pageRank(id) : '-';



            LgroupBtn = `<span class="badge badge-pill badge-${(badgeClass) ? 'warning' : 'primary'}">${Lgroup}</span>`;
            const Loccupation = (occupation) ? occupation : '-';
            const Lcountry = (country) ? country : '-';
            const Lrealm = (realm) ? realm : '-';
            //const Lscope = (scope) ? scope : '-';
            //const Ldirective = (directive) ? directive : '-';
            const Leu_region = (eu_region) ? eu_region : '-';
            LeventsLevelBtn = (events) ? `<h5><span class="badge badge-${Lcolor}">${LeventsLevel}</span></h5>` : '-';
            LeventsTotalBtn = (events) ? `${events.total} / ${TOTAL_EVENTS}` : '-';
            $('#dataTable').dataTable().fnAddData( [
                //id,
                label,
                LgroupBtn,
                Loccupation,
                Lcountry,
                Lrealm,
                //Lscope,
                //Ldirective,
                Leu_region,
                LeventsLevelBtn,
                LeventsTotalBtn,
                dc,
                ec
            ]);
        //}
    });
}