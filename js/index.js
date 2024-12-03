/*****************************************************************************
 * FILE:      EuropaBON Stakeholder Dashboard
 * DATE:      October 2023
 * AUTHOR:    Christian Langer (christian.langer@idiv.de)
 * COPYRIGHT: (c) Christian Langer 2023
 * LICENSE:   GNU General Public License v3.0
 *****************************************************************************/

import * as Utils from './modules/functions.js';

/*****************************************************************************
*                      GLOBAL VARIABLES
******************************************************************************/

const NODE_SIZE_FACTOR = 4,
      // group arrays
      occupation_array = [],
      realm_array = [],
      region_array = [],
      na_array = [],
      // group objects
      occupation_object = {},
      realm_object = {},
      region_object = {},
      na_object = {},
      project_object = {},
      category_object = {},
      clusters = {
        occupation: [
          {
            id: '10000',
            name: 'Academia',
            data: []
          },
          {
            id: '10001',
            name: 'Non-Governmental Organization',
            data: []
          },
          {
            id: '10002',
            name: 'Governmental Organization',
            data: []
          },
          {
            id: '10003',
            name: 'Private Industry',
            data: []
          },
          {
            id: '10004',
            name: 'Citizen Science',
            data: []
          },
          {
            id: '10005',
            name: 'Other',
            data: []
          }
        ],
        realm: [
          {
            id: '10000',
            name: 'Terrestrial',
            data: []
          },
          {
            id: '10001',
            name: 'Freshwater',
            data: []
          },
          {
            id: '10002',
            name: 'Marine',
            data: []
          },
          {
            id: '10003',
            name: 'Cross-realm',
            data: []
          }
        ]
      };

let eventsLevel,
    degree_object_sorted,
    eigen_object_sorted,
    lat,
    lon;

let projects_data = [];




/*****************************************************************************
 *                      TOOLTIP
 *****************************************************************************/

  $('[data-toggle="popover"]').popover();

/*****************************************************************************
 *                      TOGGLE COLLAPSE
 *****************************************************************************/

  $('#readMoreButton').click(function() {
    $(this).toggleClass( "active" );
    if ($(this).hasClass("active")) {
      $(this).text("Read less...");
    } else {
      $(this).text("Read more...");
    }
  });

/*****************************************************************************
 *                      Mutation Observer
 *****************************************************************************/

// Select the target node that you want to observe
const targetNode = document.getElementById('content');

// Options for the observer (what changes to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // Reapply event binding after DOM changes
    Utils.toggleGroups('.groups');
    $('[data-toggle="popover"]').popover();

      
     // fetch countries for popup
      if ( $("#region").hasClass("active") ) {
        var regions = document.querySelectorAll('.groups');
    
        // Function to fetch countries for a region from the REST Countries API
        async function fetchCountriesForRegion(regionName) {
          try {
            const response = await fetch(`https://europabon.org/dashboard/api/regions/${regionName}`);
            const data = await response.json();
            const countries = data.join(', ');
            return countries;
          } catch (error) {
            console.error('Error fetching data:', error);
            return 'Error fetching countries';
          }
        }
    
        // Function to update the data-content of the popover dynamically with fetched country data
        async function updatePopoverContent() {
          for (const region of regions) {
            const regionName = region.getAttribute('value');
            // Skip the region with 'value="not europe"'
            if (regionName === 'not europe') continue;
            const countries = await fetchCountriesForRegion(regionName);
            const icon = region.nextElementSibling; // Get the next sibling, which is the icon element
            icon.setAttribute('data-content', countries);
            icon.setAttribute('data-original-title', icon.getAttribute('data-original-title'));
            //region.setAttribute('data-content', countries);
            //region.setAttribute('data-original-title', region.getAttribute('data-original-title'));
          }
        }

        // Initialize tooltips and fetch country data
        updatePopoverContent();
        $('[data-toggle="popover"]').popover();
  
      };

};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
      

/*****************************************************************************
 *                      CANVAS WRAPPER
 *****************************************************************************/

async function getData() {
    const response = await fetch(
      `https://europabon.org/dashboard/api/nodes`
      //`http://localhost:8080/europabon.org/dashboard/api/nodes`
      )
    return response.json();
}


getData().then(data => {

/*****************************************************************************
*                      NODES & EDGES
******************************************************************************/

// store the counts of each project combination
const projectCounts = new Map(); 

$.each(data.nodes, key => {


    data.nodes[key].title = (data.nodes[key].title) ? Utils.htmlTitle(data.nodes[key].title) : Utils.htmlTitle('<h5>'+data.nodes[key].label+'</h5>');
    
    if(data.nodes[key].occupation) occupation_array.push(data.nodes[key].occupation.replace(/\s+/g, '_').replace('-', '_').toLowerCase());
    if(data.nodes[key].eu_region) region_array.push(data.nodes[key].eu_region.replace(/\s+/g, '_').replace('-', '_').toLowerCase());
    if(data.nodes[key].realm) { 
      var tmp_array = data.nodes[key].realm.split(',');
      for(var i = 0; i < tmp_array.length; i++) realm_array.push(tmp_array[i].replace(/\s+/g, '_').replace('-', '_').toLowerCase());
    }
    eventsLevel = (data.nodes[key].events) ? data.nodes[key].events.level : 'na';


    switch (data.nodes[key].occupation) {
      case 'Academia':
          clusters.occupation[0].data.push( (data.nodes[key].id) );
          //group_id = '10000';
          break;
      case 'Non-Governmental Organization':
          clusters.occupation[1].data.push( (data.nodes[key].id) );
          //group_id = '10001';
          break;
      case 'Governmental Organization':
        clusters.occupation[2].data.push( (data.nodes[key].id) );
        //group_id = '10002';
        break;
      case 'Private Industry':
        clusters.occupation[3].data.push( (data.nodes[key].id) );
        //group_id = '10003';
        break;
      case 'Citizen Science':
        clusters.occupation[4].data.push( (data.nodes[key].id) );
        //group_id = '10004';
        break;
      case 'Other':
        clusters.occupation[5].data.push( (data.nodes[key].id) );
        //group_id = '10005';
        break;
    }

    switch (data.nodes[key].realm) {
      case 'Terrestrial':
          clusters.realm[0].data.push( (data.nodes[key].id) );
          //group_id = '10000';
          break;
      case 'Freshwater':
          clusters.realm[1].data.push( (data.nodes[key].id) );
          //group_id = '10001';
          break;
      case 'Marine':
        clusters.realm[2].data.push( (data.nodes[key].id) );
        //group_id = '10002';
        break;
      case 'Cross-realm':
        clusters.realm[3].data.push( (data.nodes[key].id) );
        //group_id = '10003';
        break;
    }

    // switch (data.nodes[key].eu_region) {
    //   case 'Northern Europe':
    //       clusters.region[0].data.push( (data.nodes[key].id) );
    //       //group_id = '10000';
    //       break;
    //   case 'Western Europe':
    //       clusters.region[1].data.push( (data.nodes[key].id) );
    //       //group_id = '10001';
    //       break;
    //   case 'Eastern Europe':
    //     clusters.region[2].data.push( (data.nodes[key].id) );
    //     //group_id = '10002';
    //     break;
    //   case 'Southern Europe':
    //     clusters.region[3].data.push( (data.nodes[key].id) );
    //     //group_id = '10003';
    //     break;
    //   case 'not europe':
    //     clusters.region[4].data.push( (data.nodes[key].id) );
    //     //group_id = '10003';
    //     break;
    // }

    lat = data.nodes[key].lat ?? '0.000'; // Use default value if lat is undefined
    lon = data.nodes[key].lon ?? '0.000'; // Use default value if lon is undefined

    if (data.nodes[key].group !== Utils.NO_DATA) {

      if (data.nodes[key].projects) {
        const input = data.nodes[key].projects;
        const array = input.split(',').map(item => item.trim());

        const nodeProjectCounts = new Map(); // To store the counts for this node

        for (let i = 0; i < array.length; i++) {
          for (let j = i + 1; j < array.length; j++) {
            const from = array[i];
            const to = array[j];
            const combination = [from, to].sort().join(',');
  
            if (!nodeProjectCounts.has(combination)) {
              nodeProjectCounts.set(combination, 1);
            } else {
              nodeProjectCounts.set(combination, nodeProjectCounts.get(combination) + 1);
            }
          }
        }

        // Merge counts for this node into the global counts
        nodeProjectCounts.forEach((count, combination) => {
          if (!projectCounts.has(combination)) {
            projectCounts.set(combination, count);
          } else {
            projectCounts.set(combination, projectCounts.get(combination) + count);
          }
        });

      }
        

      Utils.cy.add([
        { group: 'nodes', 
          data: { 
            id: data.nodes[key].id, 
            label: data.nodes[key].label,
            group: data.nodes[key].group,
            type: data.nodes[key].eu_region,
            tooltip: data.nodes[key].title,
            //parent: group_id,
            classes: 'events-level-'+eventsLevel,
            lat: lat,
            lng: lon
          }
        }
      ]);

    }
  

});



// $.each(clusters.occupation, (index, {id,name, data}) => {

//   Utils.cy.add([
//     { group: 'nodes', 
//       data: { 
//         id: id, 
//         label: name,
//         tooltip:  Utils.htmlTitle('<h5>'+name+'</h5>')
//       }
//     }
//   ]);

//   data.forEach(element => {

//     Utils.cy.add([
//       { group: 'edges', 
//         data: { 
//           source: element,
//           target: id,
//           group: 'hidden'
//         }
//       }
//     ]);

    
//   });


// })



  $.each(data.edges, key => {

    if (data.edges[key].length != 40) {

      Utils.cy.add([
        { group: 'edges', 
          data: { 
            source: data.edges[key].from,
            target: data.edges[key].to
          }
        }
      ]);

    }

  });




/* Get count of NA`s */
// $.each(data.nodes, key => {
//   for (var i = 0; i < na_array.length; i++) {
//     if (na_array[i] == data.nodes[key].id ) {
//       na_array[i] = data.nodes[key].label;
//     }
//   }
// })

// const na_object_raw = Utils.objNums(na_array,na_object);
// const na_object_sorted = Utils.sortObject(na_object_raw);
// console.log(na_object_sorted);




// Exclude combinations with only 1 count
const filteredCounts = [...projectCounts.entries()].filter(([_, count]) => count > 1);

filteredCounts.forEach(([combination, count]) => {
  const [from, to] = combination.split(',');
  projects_data.push([from, to, count]);
});

// projectCounts.forEach((count, combination) => {
//   const [from, to] = combination.split(',');
//   projects_data.push([from, to, count]);
// });

// create object with counts of projects
projects_data.forEach(([from, to, count]) => {
  project_object[from] = (project_object[from] || 0) + count;
  project_object[to] = (project_object[to] || 0) + count;
});

// fetch projects from API
fetch('https://europabon.org/dashboard/api/projects')
  .then(response => response.json())
  .then(apiData => {
    // Iterate through the API data and count the categories only if the title is present in project_object
    apiData.forEach(apiEntry => {
      const title = apiEntry.title;
      if (project_object[title]) {
        const category = apiEntry.category;
        if (!category_object[category]) {
          category_object[category] = 1;
        } else {
          category_object[category]++;
        }
      }
    });
    const category_object_sorted = Utils.sortObject(category_object);
    Utils.topRanking(category_object_sorted,'topCategories');
    //console.log(category_object_sorted);
    
  })
  .catch(error => {
    console.error('Error fetching API-data:', error);
  });


/*****************************************************************************
*                      SORT OBJECT GROUPS
******************************************************************************/

const occupation_object_sorted = Utils.sortObject(Utils.objNums(occupation_array,occupation_object));
const realm_object_sorted = Utils.sortObject(Utils.objNums(realm_array,realm_object));
const region_object_sorted = Utils.sortObject(Utils.objNums(region_array,region_object));
const project_object_sorted = Utils.sortObject(project_object);

//console.log(project_object_sorted);
//console.log(Object.keys(project_object_sorted).length);

/*****************************************************************************
*                      FETCH VALUES FOR NODES/EDGES
******************************************************************************/

// nodes array length
//const nodesFilter = data.nodes.filter(node => !Utils.groups.includes(node.id) );
$("#totalNodes").html(data.nodes.length);

// edges array length
//const edgesFilter = data.edges.filter(edge => edge.length !== 0.5 );
$("#totalEdges").html(data.edges.length);


/*****************************************************************************
*                      CYTOSCAPE
******************************************************************************/

// Function to show the spinner
function showSpinner() {
  const spinnerContainer = document.getElementById('spinner');
  spinnerContainer.style.display = 'block';
}
// Function to hide the spinner
function hideSpinner() {
  const spinnerContainer = document.getElementById('spinner');
  spinnerContainer.style.display = 'none';
}

// Function to bind/unbind the mouseover event
function bindMouseoverEvent() {
  Utils.cy.nodes().bind("mouseover", (event) => {
    event.target.popperRefObj = event.target.popper({
      content: () => {
        let content = document.createElement("div");
        content.classList.add("popper-div");
        content.appendChild(event.target.data('tooltip'));
        document.body.appendChild(content);
        return content;
      },
    });
  });
}
function unbindMouseoverEvent() {
  Utils.cy.nodes().unbind("mouseover");
}
// Function to bind/unbind mouseout event
function bindMouseoutEvent(){
  Utils.cy.nodes().bind("mouseout", (event) => {
    if (event.target.popper) {
      event.target.popperRefObj.state.elements.popper.remove();
      event.target.popperRefObj.destroy();
    }
  });
}
function unbindMouseoutEvent() {
  Utils.cy.nodes().unbind("mouseout");
}

const jsonStylesheet = [
  {
    selector: 'edge',
    style: {
      'width': 1
    }
  },
  {
    selector: 'edge[group="hidden"], node[label="Academia"], node[label="Terrestrial"], node[label="Non-Governmental Organization"], node[label="Freshwater"], node[label="Governmental Organization"], node[label="Marine"], node[label="Private Industry"], node[label="Cross-realm"], node[label="Citizen Science"], node[label="Other"]',
    style: {
      'display': 'none'
    }
  },
  {
    selector: 'node[group="dataprovider"]',
    style: {
      shape: 'triangle'
    }
  },     
  {
    selector: 'node[group="datauser_provider"]',
    style: {
      shape: 'diamond'
    }
  },
  {
    selector: 'node[group="N.A."]',
    style: {
      'background-color': '#eaeaea'
    }
  },
  {
    selector: 'node[type="Academia"], node[type="Terrestrial"], node[type="Northern Europe"]',
    style: {
      'border-color': 'green',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Non-Governmental Organization"], node[type="Freshwater"], node[type="Western Europe"]',
    style: {
      'border-color': 'orange',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Governmental Organization"], node[type="Marine"], node[type="Eastern Europe"]',
    style: {
      'border-color': 'red',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Private Industry"], node[type="Cross-realm"], node[type="Southern Europe"]',
    style: {
      'border-color': 'blue',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Citizen Science"], node[type="not europe"]',
    style: {
      'border-color': 'yellow',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Other"]',
    style: {
      'border-color': 'purple',
      'border-width': 8
    }
  },
  {
    selector: 'node[classes="events-level-0"]',
    style: {
      'background-color': '#fff'
    }
  },
  {
    selector: 'node[classes="events-level-1"]',
    style: {
      'background-color': '#999'
    }
  },
  {
    selector: 'node[classes="events-level-2"]',
    style: {
      'background-color': '#111'
    }
  },
  {
    selector: 'node[classes="hidden"]',
    style: {
      'display': 'none'
    }
  }
];

const options_map = {
  name: "preset",
  fit: false,
  idealEdgeLength: function (edge) {
    return (edge.data().group === "hidden") ? 1 : 800;
  },
  padding: 0,
  nestingFactor: 1,
  nodeSeparation: 200,
  edgeElasticity: function (edge) {
    return (edge.data().group === "hidden") ? 1 : 200;
  },
  ready: function() {
    // Layout is ready
    hideSpinner();
    unbindMouseoverEvent();
    bindMouseoverEvent();
    unbindMouseoutEvent();
    bindMouseoutEvent();
    Utils.cy.style().
    selector('node[type="Academia"], node[type="Terrestrial"], node[type="Northern Europe"], node[type="Non-Governmental Organization"], node[type="Freshwater"], node[type="Western Europe"], node[type="Governmental Organization"], node[type="Marine"], node[type="Eastern Europe"], node[type="Private Industry"], node[type="Cross-realm"], node[type="Southern Europe"], node[type="Citizen Science"], node[type="not europe"], node[type="Other"]').
      style({
        'border-width': 1
      }).
      selector('edge').
      style({
        'width': 0.2
      }).
      selector('node[classes="events-level-0"]').
      style({
        'width': 5,
        'height': 5
      }).
      selector('node[classes="events-level-1"]').
      style({
        'width': 10,
        'height': 10
      }).
      selector('node[classes="events-level-2"]').
      style({
        'width': 15,
        'height': 15
      }).
      update()
  },
  stop: function() {
    // Layout is stopped, hide the spinner
    hideSpinner();
  }
};

const options = {
  name: "fcose",
  fit: true,
  idealEdgeLength: function (edge) {
    return (edge.data().group === "hidden") ? 1 : 800;
  },
  padding: 0,
  nestingFactor: 1,
  nodeSeparation: 200,
  edgeElasticity: function (edge) {
    return (edge.data().group === "hidden") ? 1 : 200;
  },
  ready: function() {
    // Layout is ready
    hideSpinner();
    unbindMouseoverEvent();
    bindMouseoverEvent();
    unbindMouseoutEvent();
    bindMouseoutEvent();
    Utils.cy.style().
    selector('node[classes="events-level-0"]').
      style({
        'width': 20,
        'height': 20
      }).
      selector('node[classes="events-level-1"]').
      style({
        'width': 40,
        'height': 40
      }).
      selector('node[classes="events-level-2"]').
      style({
        'width': 80,
        'height': 80
      }).
      update()
  },
  stop: function() {
    // Layout is stopped, hide the spinner
    hideSpinner();
  }
};

/*****************************************************************************
*                      LEAFLET
******************************************************************************/

let leaf = Utils.cy.leaflet({ container: document.getElementById('cy-leaflet') });

// Creating zoom control
var zoom = L.control.zoom();
// Adding zoom control to the map
zoom.addTo(leaf.map);

leaf.map.setView([52, 13],4);

Utils.cy.style(jsonStylesheet).update(); // Applies the JSON stylesheet to the graph

Utils.cy.layout(options_map).run();




/*****************************************************************************
*                     EVENT ON READY
******************************************************************************/


Utils.cy.ready( event => {

  
  /*                   TYPEAHEAD
  *************************************/

  $("#search-node-div").html('<i class="fas fa-search"></i><input type="text" id="search-node-input" class="form-control shadow-none typeahead tt-query" placeholder="Search and zoom to node"></input>');
  const nodeNames = new Array();
  const nodeIds = new Object();

  $.each(data.nodes, (index, {label, id}) => {
    //if (!Utils.groups.includes(id)) {
      nodeNames.push(label);
      nodeIds[label] = id;
    //}
  });


  $('.typeahead').typeahead({
    source: nodeNames,
    updater: function (item){
      Utils.cy.viewUtilities().disableMarqueeZoom();
      Utils.cy.viewUtilities().disableLassoMode();
      const selectedNode = Utils.cy.$(`#${nodeIds[item]}`);
      // Update the Leaflet map's view based on the selected node's position
      if ( $("#region").hasClass("active") ) {
        lat = selectedNode.data('lat');
        lon = selectedNode.data('lng');
        if (lat !== undefined && lon !== undefined) {
          if (leaf) {
            const targetLatLng = L.latLng(lat, lon);
            leaf.map.setView(targetLatLng, 10); // Adjust the zoom level as needed
          }
        }
      }
      Utils.cy.viewUtilities().zoomToSelected(selectedNode);
    }
  })

  


  /*             GENERATE TOP RANKING
  *************************************/

  degree_object_sorted = Utils.sortObject(Utils.degreeObject(data.nodes));
  eigen_object_sorted = Utils.sortObject(Utils.eigenObject(data.nodes));

  Utils.topRanking(degree_object_sorted,'topCentrality');
  Utils.topRanking(occupation_object_sorted,'totalGroups');
  Utils.topRanking(project_object_sorted,'topProjects');


  /*                  POPULATE CSS/HTML
  *************************************/

    $("#info-box, #legend").show();
    $(".no-data-name").html(Utils.NO_DATA);
    $(".info-legend").html('<div class="float-left">Click group to hide | Draw window to zoom</div><div class="float-right"><sup>*</sup> by factor of 10</div>');

    //$("#maxDegree").html( (Utils.cy.nodes().maxDegree()/25).toFixed() );

    /*                     DATATABLE
  *************************************/

  Utils.populateDataTable(data.nodes);

  /*                     TOGGLE GROUPS
  *************************************/

 Utils.toggleGroups('.groups');



});


/*****************************************************************************
*                      HIGH CHARTS
******************************************************************************/

/*             GENERATE CHART DATA
  *************************************/



const chartArrays = Utils.chartData(data.nodes);
//console.log(chartArrays);

//Utils.chartData2(data.nodes);

// console.log(Utils.scatter_data_degree);
// console.log(Utils.scatter_data_eigen);
// console.log(Utils.bplot_data_degree);
// console.log(Utils.bplot_data_eigen);

/*                      SCATTER PLOT
***************************************/


const chart_scatter = Highcharts.chart('highcharts-activity-degreecentrality', {
    chart: {
        type: 'line',
        zoomType: 'xy',
        events: {
          load: function() {
            this.update({
              plotOptions: {
                scatter: {
                  marker: {
                    symbol: "circle",
                    fillColor: this.series.color
                  }
                }
              }
            });
          }
        }
    },
    xAxis: {
        title: {
            text: 'Degree centrality'
        },
        labels: {
            format: '{value}'
        },
        startOnTick: false,
        endOnTick: false,
        showLastLabel: true
    },
    yAxis: {
        title: {
            text: 'Number of events'
        },
        labels: {
            format: '{value}'
        }
    },
    title: {
      text: null
    },
    legend: {
        enabled: true,
        align: 'left'
    },
    tooltip: {
      formatter: function () {
        if (this.series.data.length > 2) {
          return (
            `Centrality: ${this.x} <br/> Number of events: ${this.y}`
          );
        } else {
          return (
            `${this.series.name} <br/>r: ${this.series.userOptions.r.toFixed(2)}`
          );
        }
      }
    },
    series: chartArrays.region.scatter_degree,
    credits: {
      enabled: false
    },
    navigation: {
      buttonOptions: {
          height: 40,
          width: 40,
          symbolSize: 24,
          symbolX: 23,
          symbolY: 21,
          symbolStrokeWidth: 3
      }
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS"
          ]
        }
      }
    }
});

/*        Projects Connections
***************************************/

Highcharts.setOptions({
  colors: ['#440154', '#482475', '#414487', '#355F8D', '#2A788E',
           '#21918C', '#22A784', '#43BF71', '#7AD151', '#FDE725']
});


Highcharts.chart('projects-container', {
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  accessibility: {
      point: {
          valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
      }
  },
  series: [{
      keys: ['from', 'to', 'weight'],
      data: projects_data,
      type: 'dependencywheel',
      name: 'Total Connections',
      dataLabels: {
        color: '#333',
        style: {
          fontSize: '12px',
        },
        textPath: {
          enabled: false
        }
      }
  }],
  navigation: {
    buttonOptions: {
        height: 40,
        width: 40,
        symbolSize: 24,
        symbolX: 23,
        symbolY: 21,
        symbolStrokeWidth: 3
    }
  },
  exporting: {
    buttons: {
      contextButton: {
        menuItems: [
          "viewFullscreen",
          "printChart",
          "separator",
          "downloadPNG",
          "downloadJPEG",
          "downloadPDF",
          "downloadSVG",
          "separator",
          "downloadCSV",
          "downloadXLS"
        ]
      }
    }
  }
});



/*                      BOXPLOT
***************************************/

const chart_boxplot = Highcharts.chart('highcharts-occupation-degreecentrality', {
  chart: {
      type: 'boxplot',
      zoomType: 'xy',
      inverted: true
  },
  title: {
    text: null
  },
  legend: {
      enabled: true,
      align: 'left'
  },
  xAxis: {
    categories: [],
    labels: {
      enabled: false
    },
    title: {
        text: "EU region"
    }
  },
  yAxis: {
    title: {
        text: 'Degree centrality'
    },
    labels: {
        format: '{value}'
    },
    startOnTick: false,
    endOnTick: false,
    showLastLabel: true
  },
  tooltip: {
    headerFormat: ''
  },
  plotOptions: {
    boxplot: {
        medianColor: '#0C5DA5',
        medianWidth: 3
    }
},
series: chartArrays.region.bplot_degree,
credits: {
  enabled: false
},
navigation: {
  buttonOptions: {
      height: 40,
      width: 40,
      symbolSize: 24,
      symbolX: 23,
      symbolY: 21,
      symbolStrokeWidth: 3
  }
},
exporting: {
  buttons: {
    contextButton: {
      menuItems: [
        "viewFullscreen",
        "printChart",
        "separator",
        "downloadPNG",
        "downloadJPEG",
        "downloadPDF",
        "downloadSVG",
        "separator",
        "downloadCSV",
        "downloadXLS"
      ]
    }
  }
}
});

/*****************************************************************************
*                      CLICK EVENTS
******************************************************************************/

$('#fitToExtent').on('click', function() { 
  Utils.cy.fit();
  if ($("#region").hasClass("active")) leaf.fit();
});

$('#occupation').on('click', function() {

  if ( $(this).hasClass("active") ) return; // Exit the function without executing the code

  // Remove all nodes and edges from the graph
  Utils.cy.remove('*');

  // Remove leaflet map
  if (leaf != null) {
    // Destroy the existing map instance
    leaf.destroy();
    leaf = undefined;
  }

  // Show the spinner before starting the layout
  showSpinner();

  $('.nav-item').find('a.active').removeClass('active');
  $(this).addClass("active");

  $(".group-header-name").text("Sector");
  $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Academia"> Academia</small><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Non-Governmental Organization"> NGO</small><br>
    <div class="rectangle color-red"></div><small class="groups" value="Governmental Organization"> Governmental Organization</small><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Private Industry"> Private Industry</small><br>
    <div class="rectangle color-yellow"></div><small class="groups" value="Citizen Science"> Citizen Science</small><br>
    <div class="rectangle color-purple"></div><small class="groups" value="Other"> Other</small>
  `)

  // Scatter plot
  $('#select_activity_centrality').val('degree');
  chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
  chartArrays.occupation.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );

  // Boxplot
  $('#select_group_centrality').val('degree');
  chart_boxplot.xAxis[0].setTitle({ text: 'Sector' });
  chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
  chartArrays.occupation.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
  
  
    // Defer the layout computation using setTimeout
    setTimeout(function() {

      $.each(data.nodes, key => {

        eventsLevel = (data.nodes[key].events) ? data.nodes[key].events.level : 'na';

        Utils.cy.add([
          { group: 'nodes', 
            data: { 
              id: data.nodes[key].id, 
              label: data.nodes[key].label,
              group: data.nodes[key].group,
              type: data.nodes[key].occupation,
              tooltip: data.nodes[key].title,
              //parent: group_id,
              classes: 'events-level-'+eventsLevel
            }
          }
        ]);
      });

      $.each(clusters.occupation, (index, {id,name, data}) => {
        Utils.cy.add([
          { group: 'nodes', 
            data: { 
              id: id, 
              label: name,
              tooltip:  Utils.htmlTitle('<h5>'+name+'</h5>')
            }
          }
        ]);
        data.forEach(element => {
          Utils.cy.add([
            { group: 'edges', 
              data: { 
                source: element,
                target: id,
                group: 'hidden'
              }
            }
          ]);
        });
      });

      $.each(data.edges, key => {
        Utils.cy.add([
          { group: 'edges', 
            data: { 
              source: data.edges[key].from,
              target: data.edges[key].to
            }
          }
        ]);
      });

      $("#europabon-network").css("background","#fff");

      // Applies the JSON stylesheet to the graph
      Utils.cy.style(jsonStylesheet).update();

      // Trigger a redraw of the graph to reflect the changes
      Utils.cy.layout(options).run();

    }, 10); // Adjust the timeout value as needed, e.g., 100 or 200ms

})

$('#realm').on('click', function() {

  if ( $(this).hasClass("active") ) return; // Exit the function without executing the code

  // Remove leaflet map
  if (leaf != null) {
    // Destroy the existing map instance
    leaf.destroy();
    leaf = undefined;
  }

  // Remove all nodes and edges from the graph
  Utils.cy.remove('*');
  
  // Show the spinner before starting the layout
  showSpinner();

  
  $('.nav-item').find('a.active').removeClass('active');
  $(this).addClass("active");

  $(".group-header-name").text("Realm");
   $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Terrestrial"> Terrestrial</small><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Freshwater"> Freshwater</small><br>
    <div class="rectangle color-red"></div><small class="groups" value="Marine"> Marine</small><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Cross-realm"> Cross-realm</small><br>
    `)

  // Scatter plot
  $('#select_activity_centrality').val('degree');
  chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
  chartArrays.realm.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );

  // Boxplot
  $('#select_group_centrality').val('degree');
  chart_boxplot.xAxis[0].setTitle({ text: 'Realm' });
  chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
  chartArrays.realm.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
    
    // Defer the layout computation using setTimeout
    setTimeout(function() {

      $.each(data.nodes, key => {

        eventsLevel = (data.nodes[key].events) ? data.nodes[key].events.level : 'na';

        Utils.cy.add([
          { group: 'nodes', 
            data: { 
              id: data.nodes[key].id, 
              label: data.nodes[key].label,
              group: data.nodes[key].group,
              type: data.nodes[key].realm,
              tooltip: data.nodes[key].title,
              //parent: group_id,
              classes: 'events-level-'+eventsLevel
            }
          }
        ]);
      });

      $.each(clusters.realm, (index, {id,name, data}) => {
        Utils.cy.add([
          { group: 'nodes', 
            data: { 
              id: id, 
              label: name,
              tooltip:  Utils.htmlTitle('<h5>'+name+'</h5>')
            }
          }
        ]);
        data.forEach(element => {
          Utils.cy.add([
            { group: 'edges', 
              data: { 
                source: element,
                target: id,
                group: 'hidden'
              }
            }
          ]);
        });
      });

      $.each(data.edges, key => {
        Utils.cy.add([
          { group: 'edges', 
            data: { 
              source: data.edges[key].from,
              target: data.edges[key].to
            }
          }
        ]);
      });

      $("#europabon-network").css("background","#fff");

      // Applies the JSON stylesheet to the graph
      Utils.cy.style(jsonStylesheet).update();

      // Trigger a redraw of the graph to reflect the changes
      Utils.cy.layout(options).run();

    }, 10); // Adjust the timeout value as needed, e.g., 100 or 200ms

})

$('#region').on('click', function() {

  if ( $(this).hasClass("active") ) return; // Exit the function without executing the code
  
  // Remove all nodes and edges from the graph
  Utils.cy.remove('*');

  // Show the spinner before starting the layout
  showSpinner();

  $('.nav-item').find('a.active').removeClass('active');
  $(this).addClass("active");

  $(".group-header-name").text("EU region");
  $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Northern Europe"> Northern Europe</small> <i class="fas fa-info-circle align-middle" data-toggle="popover" data-trigger="hover" data-html="true" data-original-title="Northern Europe"></i><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Western Europe"> Western Europe</small> <i class="fas fa-info-circle align-middle" data-toggle="popover" data-trigger="hover" data-html="true" data-original-title="Western Europe"></i><br>
    <div class="rectangle color-red"></div><small class="groups" value="Eastern Europe"> Eastern Europe</small> <i class="fas fa-info-circle align-middle" data-toggle="popover" data-trigger="hover" data-html="true" data-original-title="Eastern Europe"></i><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Southern Europe"> Southern Europe</small> <i class="fas fa-info-circle align-middle" data-toggle="popover" data-trigger="hover" data-html="true" data-original-title="Southern Europe"></i><br>
    <div class="rectangle color-yellow"></div><small class="groups" value="not europe"> Not Europe</small><br>
  `)

  // Scatter plot
  $('#select_activity_centrality').val('degree');
  chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
  chartArrays.region.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );

  // Boxplot
  $('#select_group_centrality').val('degree');
  chart_boxplot.xAxis[0].setTitle({ text: 'EU region' });
  chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
  while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
  chartArrays.region.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
  


  // Defer the layout computation using setTimeout
  setTimeout(function() {
  
    $.each(data.nodes, key => {

      lat = data.nodes[key].lat ?? '0.000'; // Use default value if lat is undefined
      lon = data.nodes[key].lon ?? '0.000'; // Use default value if lon is undefined

      eventsLevel = (data.nodes[key].events) ? data.nodes[key].events.level : 'na';
  
      if (data.nodes[key].group !== Utils.NO_DATA) {
    
        Utils.cy.add([
          { group: 'nodes', 
            data: { 
              id: data.nodes[key].id, 
              label: data.nodes[key].label,
              group: data.nodes[key].group,
              type: data.nodes[key].eu_region,
              tooltip: data.nodes[key].title,
              //parent: group_id,
              classes: 'events-level-'+eventsLevel,
              lat: lat,
              lng: lon
            }
          }
        ]);
    
      }

    });


    $.each(data.edges, key => {

      if (data.edges[key].length != 40) {
  
        Utils.cy.add([
          { group: 'edges', 
            data: { 
              source: data.edges[key].from,
              target: data.edges[key].to
            }
          }
        ]);
  
      }
  
    });

    leaf = Utils.cy.leaflet({ container: document.getElementById('cy-leaflet') });

    // Creating zoom control
    var zoom = L.control.zoom();
    // Adding zoom control to the map
    zoom.addTo(leaf.map);

    leaf.map.setView([52, 13],4);

    $("#europabon-network").css("background","none");

    // Applies the JSON stylesheet to the graph
    Utils.cy.style(jsonStylesheet).update();

    // Trigger a redraw of the graph to reflect the changes
    Utils.cy.layout(options_map).run();

    // Call function again to prevent error
    $('#fitToExtent').on('click', function() {
      if ($("#region").hasClass("active")) leaf.fit();
    });

  }, 10); // Adjust the timeout value as needed, e.g., 100 or 200ms

  

})

$('#saveAsImage').on('click', function() { Utils.saveAsImage() })


/*****************************************************************************
*                      CHANGE EVENTS
******************************************************************************/

$('#select_group_centrality').on('change', function() {
  const chartType = 'bplot';
  const centralityType = $(this).val();
  const chart = chart_boxplot;

  if (centralityType === 'eigen') {
    chart.yAxis[0].setTitle({ text: 'Eigenvector centrality' });
  } else if (centralityType === 'degree') {
    chart.yAxis[0].setTitle({ text: 'Degree centrality' });
  }

  while (chart.series.length > 0) chart.series[0].remove(false);

  if ($("#occupation").hasClass("active")) {
    chartArrays.occupation[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  } else if ($("#realm").hasClass("active")) {
    chartArrays.realm[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  } else if ($("#region").hasClass("active")) {
    chartArrays.region[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  }
});

$('#select_activity_centrality').on('change', function() {
  const chartType = 'scatter';
  const centralityType = $(this).val();
  const chart = chart_scatter;

  if (centralityType === 'eigen') {
    chart.xAxis[0].setTitle({ text: 'Eigenvector centrality' });
  } else if (centralityType === 'degree') {
    chart.xAxis[0].setTitle({ text: 'Degree centrality' });
  }

  while (chart.series.length > 0) chart.series[0].remove(false);
  
  if ($("#occupation").hasClass("active")) {
    chartArrays.occupation[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  } else if ($("#realm").hasClass("active")) {
    chartArrays.realm[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  } else if ($("#region").hasClass("active")) {
    chartArrays.region[`${chartType}_${centralityType}`].forEach((e) => chart.addSeries(e));
  }
});



// $('#select_group_centrality').on('change', function() {
//   switch ($(this).val()) {
//     case 'eigen':
//       if ( $("#occupation").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.occupation.bplot_eigen.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       if ( $("#realm").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.realm.bplot_eigen.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       if ( $("#region").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.region.bplot_eigen.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       break;
//     case 'degree':
//       if ( $("#occupation").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.occupation.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       if ( $("#realm").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.realm.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       if ( $("#region").hasClass("active") ) {
//         chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
//         chartArrays.region.bplot_degree.forEach((e) => chart_boxplot.addSeries(e) );
//       }
//       break;
//   }
// })
// $('#select_activity_centrality').on('change', function() {
//   switch ($(this).val()) {
//     case 'eigen':
//       if ( $("#occupation").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.occupation.scatter_eigen.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       if ( $("#realm").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.realm.scatter_eigen.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       if ( $("#region").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Eigenvector centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.region.scatter_eigen.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       break;
//     case 'degree':
//       if ( $("#occupation").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.occupation.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       if ( $("#realm").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.realm.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       if ( $("#region").hasClass("active") ) {
//         chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
//         while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
//         chartArrays.region.scatter_degree.forEach((e) => chart_scatter.addSeries(e) );
//       }
//       break;
//   }
// })

$('#select_centrality_ranking').on('change', function() {
  switch ($(this).val()) {
    case 'degreeRank':
      $(".rank-name").text("connected");
      $("#topCentrality").empty();
      Utils.topRanking(degree_object_sorted,'topCentrality');
      break;
    case 'eigenRank':
      $(".rank-name").text("central");
      $("#topCentrality").empty();
      Utils.topRanking(eigen_object_sorted,'topCentrality');
      break;
  }
})
$('#select_group').on('change', function() {
  switch ($(this).val()) {
    case 'occupation':
      $(".group-name").text("Sector");
      $("#totalGroups").empty();
      Utils.topRanking(occupation_object_sorted,'totalGroups');
      break;
    case 'realm':
      $(".group-name").text("Realm");
      $("#totalGroups").empty();
      Utils.topRanking(realm_object_sorted,'totalGroups');
      break;
    case 'region':
      $(".group-name").text("EU regions");
      $("#totalGroups").empty();
      Utils.topRanking(region_object_sorted,'totalGroups');
      break;
  }
})


}); // getData complete



