require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer","esri/request"],
(Map, MapView, FeatureLayer,esriRequest) => {
    const layer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",

        popupTemplate:{
          title: "CollegesUniversities: {NAME}",
          content: `<ul>
                      <li>
                      CITY: {CITY}
                      </li>
                      <li>
                      STATE: {STATE}
                      </li>
                      <li>
                      Enrolled Students: {TOT_ENROLL}
                      </li>
                  </ul>`
      },

      });
    const myMap = new Map({
        basemap: "streets-night-vector",
        layers:[layer]
    });

    const view = new MapView({
        map: myMap,
        container: "map"
    });

    layer.featureReduction = {
        
        type: "cluster",
        clusterRadius: "100px",
        clusterMinSize: "24px",
        clusterMaxSize: "60px",

        fields :[{
          name: "SUM_TOT_ENROLL",
          onStatisticField: "TOT_ENROLL",
          statisticType: "sum"
        }],

        popupTemplate: {
            title: "Cluster summary",
            content: "This cluster represents <b>{cluster_count}</b> schools.and <b>{SUM_TOT_ENROLL}</b> students",
            fieldInfos: [{
              fieldName: "cluster_count",
              format: {
                digitSeparator: true,
                places: 0
              }
            }]
          },

        labelingInfo: [{
          deconflictionStrategy: "none",
          labelExpressionInfo: {
            expression: "Text($feature.cluster_count, '#,###')"
          },
          symbol: {
            type: "text",
            color: "#ffffff",
            font: {
              weight: "bold",
              family: "Noto Sans",
              size: "12px"
            }
          },
          labelPlacement: "center-center",
        }]
      }
// =====================
//options lists

      var requrl="https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0/query"
      var reqoptions={
        query:{
          where: "1=1",
          outFields:"NAME,STATE,TOT_ENROLL,FID",
          f:"json"
        }
      }
      var uniNames=document.getElementById("uniNames")
      esriRequest(requrl,reqoptions).then(function(res){
        // console.log(res)
        var names=[]
        for(let i=0;i<res.data.features.length; i++ ){
          if(!names.includes(res.data.features[i].attributes.NAME)){
            names.push(res.data.features[i].attributes.NAME)
          var opt= document.createElement("option")
          opt.value=res.data.features[i].attributes.NAME
          opt.textContent=res.data.features[i].attributes.NAME
          uniNames.appendChild(opt)
        }
        }
      })

      uniNames.addEventListener("change",function(){
        // alert(this.value)
        if(this.value=="All"){
          layer.definitionExpression=""
        }
        else{
          layer.definitionExpression="NAME='"+this.value+"'"
        }
        layer.queryExtent().then(function(data){
          view.goTo(data.extent,{duration:5000})
        })
        
      })
// =====
      var stateNames=document.getElementById("stateNames")
      esriRequest(requrl,reqoptions).then(function(res){
        // console.log(res)
        var states=[]
        for(let i=0;i<res.data.features.length; i++ ){
          if(!states.includes(res.data.features[i].attributes.STATE)){
            states.push(res.data.features[i].attributes.STATE)
          var opt= document.createElement("option")
          opt.value=res.data.features[i].attributes.STATE
          opt.textContent=res.data.features[i].attributes.STATE
          stateNames.appendChild(opt)
        }
        }
      })

      stateNames.addEventListener("change",function(){
        // alert(this.value)
        if(this.value=="All"){
          layer.definitionExpression=""
        }
        else{
          layer.definitionExpression="STATE='"+this.value+"'"
        }
        layer.queryExtent().then(function(data){
          view.goTo(data.extent,{duration:5000})
        })
        
      })

// ========================
//the charts
var definition = {
  type: "bar",
  datasets: [
    {
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
      query: {
        groupByFieldsForStatistics: 'CITY',
        // orderByFields: "TOT_ENROLL DESC"
      }
    }
  ],
  series: [
    {
      category: { field: "CITY", label: "CITY" },
      value: { field: "TOT_ENROLL", label: "No Of Students" }
    }
  ]
};

var cedarChart1 = new cedar.Chart("noStudentsPerCity", definition);
cedarChart1.show();

view.watch('extent', function(newValue) {
  var newExtent = JSON.stringify(newValue);
  cedarChart1.datasets()[0].query.geometry = newExtent;
  cedarChart1.show();
});


var definition2 = {
  type: "bar",
  datasets: [
    {
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
      query: {
        groupByFieldsForStatistics: 'STATE',
        // orderByFields: "TOT_ENROLL DESC"
      }
    }
  ],
  series: [
    {
      category: { field: "STATE", label: "STATE" },
      value: { field: "TOT_ENROLL", label: "No Of Students" }
    }
  ]
};

var cedarChart2 = new cedar.Chart("noStudentsPerState", definition2);
cedarChart2.show();

view.watch('extent', function(newValue) {
  var newExtent = JSON.stringify(newValue);
  cedarChart2.datasets()[0].query.geometry = newExtent;
  cedarChart2.show();
});

// =====
var definition3 = {
  type: 'bar',
  datasets: [{
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
    query: {
      groupByFieldsForStatistics: 'CITY',
      outStatistics: [{
        'statisticType': 'sum',
        'onStatisticField': 'FID',
        'outStatisticFieldName': 'FID_SUM'
      }],
      // orderByFields: 'FID_SUM DESC'
    }
  }],
  series: [{
    category: {
      field: 'CITY',
      label: 'CITY'
    },
    value: {
      field: 'FID_SUM',
      label: 'No Of Schools'
    }
  }]
};

var cedarChart3 = new cedar.Chart('noSchoolsPerCity', definition3);
cedarChart3.show();

view.watch('extent', function(newValue) {
  var newExtent = JSON.stringify(newValue);
  cedarChart3.datasets()[0].query.geometry = newExtent;
  cedarChart3.show();
});

var definition4 = {
  type: 'bar',
  datasets: [{
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
    query: {
      groupByFieldsForStatistics: 'STATE',
      outStatistics: [{
        'statisticType': 'sum',
        'onStatisticField': 'FID',
        'outStatisticFieldName': 'FID_SUM'
      }],
      // orderByFields: 'FID_SUM DESC'
    }
  }],
  series: [{
    category: {
      field: 'STATE',
      label: 'STATE'
    },
    value: {
      field: 'FID_SUM',
      label: 'No Of Schools'
    }
  }]
};

var cedarChart4 = new cedar.Chart('noSchoolsPerState', definition4);
cedarChart4.show();


view.watch('extent', function(newValue) {
  var newExtent = JSON.stringify(newValue);
  cedarChart4.datasets()[0].query.geometry = newExtent;
  cedarChart4.show();
});

});