/*****************************************************************************
*                      GLOBAL VARIABLES
******************************************************************************/

export const cy = cytoscape({ container: document.getElementById('europabon-network')}),
            groups = [10000,10001,10002,10003,10004,10005],
            TOTAL_EVENTS = '13',
            NO_DATA = 'N.A.',
            scatter_data_degree = [{data: []},{data: []},{data: []},{data: []},{data: []},{data: []}],
            scatter_data_eigen = [{data: []},{data: []},{data: []},{data: []},{data: []},{data: []}],
            bplot_data_degree = [{data: []},{data: []},{data: []},{data: []},{data: []},{data: []}],
            bplot_data_eigen = [{data: []},{data: []},{data: []},{data: []},{data: []},{data: []}];



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
    return result;
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
    boxValues[0][4] = Math.max(...data);
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
    return cy.elements().pageRank().rank(`#${id}`).toFixed(5);
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

    let i = 0, degree, eigen;
    $.each(data, (index, {id, occupation, events}) => {

        if (occupation){
            degree = degreeCentrality(id);
            eigen = pageRank(id)*10;
        }
        
        switch (occupation) {
            case 'Academia':
                scatter_data_degree[0].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[0].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[0].data.push( degree ); 
                bplot_data_eigen[0].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[0]['name'] = occupation;
                    scatter_data_eigen[0]['name'] = occupation;
                    bplot_data_degree[0]['name'] = occupation;
                    bplot_data_eigen[0]['name'] = occupation;
                } while (i < 1);
                break;
            case 'Non-Governmental Organization':
                scatter_data_degree[1].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[1].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[1].data.push( degree ); 
                bplot_data_eigen[1].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[1]['name'] = occupation;
                    scatter_data_eigen[1]['name'] = occupation;
                    bplot_data_degree[1]['name'] = occupation;
                    bplot_data_eigen[1]['name'] = occupation;
                } while (i < 1);
                break;
            case 'Governmental Organization':
                scatter_data_degree[2].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[2].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[2].data.push( degree ); 
                bplot_data_eigen[2].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[2]['name'] = occupation;
                    scatter_data_eigen[2]['name'] = occupation;
                    bplot_data_degree[2]['name'] = occupation;
                    bplot_data_eigen[2]['name'] = occupation;
                } while (i < 1);
                break;
            case 'Private Industry':
                scatter_data_degree[3].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[3].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[3].data.push( degree ); 
                bplot_data_eigen[3].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[3]['name'] = occupation;
                    scatter_data_eigen[3]['name'] = occupation;
                    bplot_data_degree[3]['name'] = occupation;
                    bplot_data_eigen[3]['name'] = occupation;
                } while (i < 1);
                break;
            case 'Citizen Science':
                scatter_data_degree[4].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[4].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[4].data.push( degree ); 
                bplot_data_eigen[4].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[4]['name'] = occupation;
                    scatter_data_eigen[4]['name'] = occupation;
                    bplot_data_degree[4]['name'] = occupation;
                    bplot_data_eigen[4]['name'] = occupation;
                } while (i < 1);
                break;
            case 'Other':
                scatter_data_degree[5].data.push( { x: degree, y: Number(events.total) } ); 
                scatter_data_eigen[5].data.push( { x: eigen, y: Number(events.total) } );
                bplot_data_degree[5].data.push( degree ); 
                bplot_data_eigen[5].data.push( eigen );
                do {
                    i++;
                    scatter_data_degree[5]['name'] = occupation;
                    scatter_data_eigen[5]['name'] = occupation;
                    bplot_data_degree[5]['name'] = occupation;
                    bplot_data_eigen[5]['name'] = occupation;
                } while (i < 1);
                break;
            }
    })

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