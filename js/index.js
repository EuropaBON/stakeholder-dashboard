/*****************************************************************************
 * FILE:      Network Analysis EuropaBON
 * DATE:      March 2023
 * AUTHOR:    Christian Langer (christian.langer@idiv.de)
 * COPYRIGHT: (c) Christian Langer 2023
 * LICENSE:   CC BY 2.0 
 *****************************************************************************/

import * as Utils from './modules/functions.js';

/*****************************************************************************
*                      GLOBAL VARIABLES
******************************************************************************/

const NODE_SIZE_FACTOR = 5,
      // group arrays
      occupation_array = [],
      realm_array = [],
      region_array = [],
      // group objects
      occupation_object = {},
      realm_object = {},
      region_object = {};
      // cluster_occupation = [{
      //   'id': '10000',
      //   'name': 'Academia',
      //   'data': []
      // },
      // {
      //   'id': '10001',
      //   'name': 'Non-Governmental Organization',
      //   'data': []
      // },
      // {
      //   'id': '10002',
      //   'name': 'Governmental Organization',
      //   'data': []
      // },
      // {
      //   'id': '10003',
      //   'name': 'Private Industry',
      //   'data': []
      // },
      // {
      //   'id': '10004',
      //   'name': 'Citizen Science',
      //   'data': []
      // },
      // {
      //   'id': '10005',
      //   'name': 'Other',
      //   'data': []
      // }];

let eventsLevel,
    degree_object_sorted,
    eigen_object_sorted;
      

/*****************************************************************************
 *                      CANVAS WRAPPER
 *****************************************************************************/

async function getData() {
    const response = await fetch(`../api/nodes`);
    return response.json();
}

getData().then(data => {

/*****************************************************************************
*                      NODES & EDGES
******************************************************************************/

$.each(data.nodes, key => {

  data.nodes[key].title = (data.nodes[key].title) ? Utils.htmlTitle(data.nodes[key].title) : Utils.htmlTitle('<h5>'+data.nodes[key].label+'</h5>');
  
  if(data.nodes[key].occupation) occupation_array.push(data.nodes[key].occupation.replace(/\s+/g, '_').replace('-', '_').toLowerCase());
  if(data.nodes[key].eu_region) region_array.push(data.nodes[key].eu_region);
  if(data.nodes[key].realm) { 
    var tmp_array = data.nodes[key].realm.split(',');
    for(var i = 0; i < tmp_array.length; i++) realm_array.push(tmp_array[i]);
  }
  eventsLevel = (data.nodes[key].events) ? data.nodes[key].events.level : 'na';

  // switch (data.nodes[key].occupation) {
  //   case 'Academia':
  //       cluster_occupation[0].data.push( (data.nodes[key].id) );
  //       group_id = '10000';
  //       break;
  //   case 'Non-Governmental Organization':
  //       cluster_occupation[1].data.push( (data.nodes[key].id) );
  //       group_id = '10001';
  //       break;
  //   case 'Governmental Organization':
  //     cluster_occupation[2].data.push( (data.nodes[key].id) );
  //     group_id = '10002';
  //     break;
  //   case 'Private Industry':
  //     cluster_occupation[3].data.push( (data.nodes[key].id) );
  //     group_id = '10003';
  //     break;
  //   case 'Citizen Science':
  //     cluster_occupation[4].data.push( (data.nodes[key].id) );
  //     group_id = '10004';
  //     break;
  //   case 'Other':
  //     cluster_occupation[5].data.push( (data.nodes[key].id) );
  //     group_id = '10005';
  //     break;
  // }

  
  Utils.cy.add([
    { group: 'nodes', 
      data: { 
        id: data.nodes[key].id, 
        label: data.nodes[key].label,
        group: data.nodes[key].group,
        type: data.nodes[key].occupation,
        tooltip: data.nodes[key].title,
        //parent: group_id
        classes: 'events-level-'+eventsLevel
      }
    }
  ]);



});



// $.each(cluster_occupation, (index, {id,name, data}) => {


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


  Utils.cy.add([
    { group: 'edges', 
      data: { 
        source: data.edges[key].from,
        target: data.edges[key].to
      }
    }
  ]);


});

//console.log(cluster_occupation);

/*****************************************************************************
*                      SORT OBJECT GROUPS
******************************************************************************/


const occupation_object_sorted = Utils.sortObject(Utils.objNums(occupation_array,occupation_object));
const realm_object_sorted = Utils.sortObject(Utils.objNums(realm_array,realm_object));
const region_object_sorted = Utils.sortObject(Utils.objNums(region_array,region_object));



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


Utils.cy.style([
  {
    selector: 'edge',
    style: {
      'width': 1
    }
  },
  // {
  //   selector: 'edge[group="hidden"]',
  //   style: {
  //     'visibility': 'hidden'
  //   }
  // },
  // {
  //   selector: 'node[label="Academia"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(0, 128, 2)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.academia.toString()
  //   }
  // },
  // {
  //   selector: 'node[label="Non-Governmental Organization"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(255, 165, 0)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.non_governmental_organization.toString(),
      
  //   }
  // },
  // {
  //   selector: 'node[label="Governmental Organization"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(255, 0, 0)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.governmental_organization.toString()
  //   }
  // },
  // {
  //   selector: 'node[label="Private Industry"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(0, 4, 255)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.private_industry.toString()
  //   }
  // },
  // {
  //   selector: 'node[label="Citizen Science"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(255, 255, 0)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.citizen_science.toString()
  //   }
  // },
  // {
  //   selector: 'node[label="Other"]',
  //   style: {
  //     'opacity': 0.01,
  //     // 'underlay-color': 'rgb(128, 1, 128)',
  //     // 'underlay-opacity': 0.2,
  //     // 'underlay-shape': 'ellipse',
  //     // 'underlay-padding': NODE_SIZE_FACTOR*occupation_object.other.toString()
  //   }
  // },
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
    selector: 'node[type="Academia"]',
    style: {
      'border-color': 'green',
      'border-width': 8,
    }
  },
  {
    selector: 'node[type="Governmental Organization"]',
    style: {
      'border-color': 'red',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Non-Governmental Organization"]',
    style: {
      'border-color': 'orange',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Private Industry"]',
    style: {
      'border-color': 'blue',
      'border-width': 8
    }
  },
  {
    selector: 'node[type="Citizen Science"]',
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
      'visibility': 'hidden'
    }
  }
]);



Utils.cy.nodes().unbind("mouseover");
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

Utils.cy.nodes().unbind("mouseout");
Utils.cy.nodes().bind("mouseout", (event) => {
  if (event.target.popper) {
    event.target.popperRefObj.state.elements.popper.remove();
    event.target.popperRefObj.destroy();
  }
});

Utils.cy.layout({
  name: 'fcose',
  // idealEdgeLength: function (edge) {
  //   return (edge.data().group === "hidden") ? 300 : 700;
  // },
  padding: 0,
  //nodeRepulsion: node => 7500,
  //nestingFactor: 1,
  nodeSeparation: 100,
  idealEdgeLength: 900,
  // edgeElasticity: function (edge) {
  //   // Default is: 100
  //   return (edge.data().group === "hidden") ? 300 : 700;
  // },
  //edgeElasticity: 700,
  packComponents: false,
  stop: function() {
    document.getElementById("spinner").innerHTML = '';
  }
}).run();




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
      Utils.cy.viewUtilities().zoomToSelected(Utils.cy.$(`#${nodeIds[item]}`));
    }
  })

  


  /*             GENERATE TOP RANKING
  *************************************/

  degree_object_sorted = Utils.sortObject(Utils.degreeObject(data.nodes));
  eigen_object_sorted = Utils.sortObject(Utils.eigenObject(data.nodes));

  Utils.topRanking(degree_object_sorted,'topCentrality');
  Utils.topRanking(occupation_object_sorted,'totalGroups');


  /*                  POPULATE CSS/HTML
  *************************************/

    $(".navbar-search").css({'padding-top': '25px'});
    $("#info-box, #legend").show();
    $(".no-data-name").html(Utils.NO_DATA);
    $(".info-legend").html('<div class="float-left">Click group to hide | Draw window to zoom</div><div class="float-right"><sup>*</sup> by factor of 10</div>');
    $("#topOccupation").html( Utils.capitalizeFirst(Object.keys(occupation_object_sorted)[0]) );
    $("#topRealm").html( Utils.capitalizeFirst(Object.keys(realm_object_sorted)[0]) );
    $("#topRegion").html( Utils.capitalizeFirst(Object.keys(region_object_sorted)[0]) );

    /*                     DATATABLE
  *************************************/

  Utils.populateDataTable(data.nodes);

   /*                     TOGGLE GROUPS
  *************************************/

  Utils.toggleGroups('.groups');


});

  

  /*             GENERATE CHART DATA
  *************************************/

  Utils.chartData(data.nodes);

/*****************************************************************************
*                      HIGH CHARTS
******************************************************************************/

Highcharts.setOptions({
  colors: ['rgba(0, 128, 2, 1)', 'rgba(255, 165, 0, 1)', 'rgba(255, 0, 0, 1)','rgba(0, 4, 255, 1)','rgba(255, 255, 0, 1)','rgba(128, 1, 128, 1)']
});

/*                      SCATTER PLOT
******************************************************************************/


const chart_scatter = Highcharts.chart('highcharts-activity-degreecentrality', {
    chart: {
        type: 'scatter',
        zoomType: 'xy'
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
        pointFormat: 'Centrality: {point.x} <br/> Number of events: {point.y}'
    },
    series: Utils.scatter_data_degree,
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
          marker: {
              symbol: 'circle'
          }
      }
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
          menuItems: ["viewFullscreen",
                      "printChart",
                      "separator",
                      "downloadPNG",
                      "downloadJPEG",
                      "downloadPDF",
                      "downloadSVG",
                      "separator",
                      "downloadCSV",
                      "downloadXLS"]
        }
      }
    }
});

/*                      BOXPLOT
******************************************************************************/

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
        text: "Occupation"
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
      menuItems: ["viewFullscreen",
                  "printChart",
                  "separator",
                  "downloadPNG",
                  "downloadJPEG",
                  "downloadPDF",
                  "downloadSVG",
                  "separator",
                  "downloadCSV",
                  "downloadXLS"]
    }
  }
}
});

$.each(Utils.bplot_data_degree, (index, {data,name}) => chart_boxplot.addSeries({data: Utils.getBoxValues(data), name: name}) );

/*****************************************************************************
*                      CLICK EVENTS
******************************************************************************/
$('#fitToExtent').on('click', function() { Utils.cy.fit() });

$('#occupation').on('click', function() {
  if(!$(this).hasClass("active") ) $(this).toggleClass("active").siblings().removeClass("active");
  $(".group-header-name").text("Occupation");
  $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Academia"> Academia</small><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Non-Governmental Organization"> NGO</small><br>
    <div class="rectangle color-red"></div><small class="groups" value="Governmental Organization"> Governmental Organization</small><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Private Industry"> Private Industry</small><br>
    <div class="rectangle color-yellow"></div><small class="groups" value="Citizen Science"> Citizen Science</small><br>
    <div class="rectangle color-purple"></div><small class="groups" value="Other"> Other</small>
  `)

})

$('#realm').on('click', function() {
  if(!$(this).hasClass("active") ) $(this).toggleClass("active").siblings().removeClass("active");
  $(".group-header-name").text("Realm");
   $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Terrestrial"> Terrestrial</small><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Freshwater"> Freshwater</small><br>
    <div class="rectangle color-red"></div><small class="groups" value="Marine"> Marine</small><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Cross-realm"> Cross-realm</small><br>
    `)
})

$('#region').on('click', function() {
  if(!$(this).hasClass("active") ) $(this).toggleClass("active").siblings().removeClass("active");
  $(".group-header-name").text("EU region");
  $("#legend-groups").html(`
    <div class="rectangle color-green"></div><small class="groups" value="Northern Europe"> Northern Europe</small><br>
    <div class="rectangle color-orange"></div><small class="groups" value="Western Europe"> Western Europe</small><br>
    <div class="rectangle color-red"></div><small class="groups" value="Eastern Europe"> Eastern Europe</small><br>
    <div class="rectangle color-blue"></div><small class="groups" value="Southern Europe"> Southern Europe</small><br>
    <div class="rectangle color-yellow"></div><small class="groups" value="Not europe"> Not europe</small><br>
  `)

})

$('#saveAsImage').on('click', function() { Utils.saveAsImage() })



/*****************************************************************************
*                      CHANGE EVENTS
******************************************************************************/

$('#select_group_centrality').on('change', function() {
  switch ($(this).val()) {
    case 'eigenvector':
      chart_boxplot.yAxis[0].setTitle({text: 'Eigenvector centrality'});
      while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
      $.each(Utils.bplot_data_eigen, (index, {data,name}) => chart_boxplot.addSeries({data: Utils.getBoxValues(data), name: name}) );
      break;
    case 'degree':
      chart_boxplot.yAxis[0].setTitle({text: 'Degree centrality'});
      while(chart_boxplot.series.length>0) chart_boxplot.series[0].remove(false);
      $.each(Utils.bplot_data_degree, (index, {data,name}) => chart_boxplot.addSeries({data: Utils.getBoxValues(data), name: name}) );
      break;
  }
})
$('#select_activity_centrality').on('change', function() {
  switch ($(this).val()) {
    case 'eigenvector':
      chart_scatter.xAxis[0].setTitle({text: 'Eigenvector centrality'});
      while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
      $.each(Utils.scatter_data_eigen, (index, {data,name}) => chart_scatter.addSeries({data: data, name: name}) );
      break;
    case 'degree':
      chart_scatter.xAxis[0].setTitle({text: 'Degree centrality'});
      while(chart_scatter.series.length>0) chart_scatter.series[0].remove(false);
      $.each(Utils.scatter_data_degree, (index, {data,name}) => chart_scatter.addSeries({data: data, name: name}) );
      break;
  }
})
$('#select_centrality_ranking').on('change', function() {
  switch ($(this).val()) {
    case 'degreeRank':
      $(".rank-name").text("connected");
      $("#topCentrality").empty();
      Utils.topRanking(degree_object_sorted,'topCentrality');
      break;
    case 'eigenRank':
      $(".rank-name").text("influential");
      $("#topCentrality").empty();
      Utils.topRanking(eigen_object_sorted,'topCentrality');
      break;
  }
})
$('#select_group').on('change', function() {
  switch ($(this).val()) {
    case 'occupation':
      $(".group-name").text("Occupation");
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


// DOM Observer
$(function() {
  var body = document.querySelector('body');
  var observer = new MutationObserver(function() { Utils.toggleGroups('.groups') });
  observer.observe(body, { subtree: true, childList : true, characterData : true});
});
