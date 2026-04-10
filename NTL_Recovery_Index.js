var countries = ee.FeatureCollection("FAO/GAUL/2015/level2");
var studyArea = countries.filter(ee.Filter.and(
  ee.Filter.eq('ADM0_NAME', 'Bangladesh'),
  ee.Filter.inList('ADM2_NAME', ['Sunamganj'])
));


  



Map.centerObject(studyArea, 9);
Map.addLayer(studyArea, {color: 'grey'}, 'Study Area (Sunamgonj)');

var floodMask = image.selfMask();


var ntlCol = ee.ImageCollection("NASA/VIIRS/002/VNP46A2")
  .select('Gap_Filled_DNB_BRDF_Corrected_NTL');


function getMeanNTL(start, end) {
  return ntlCol
  .filterDate(start, end)
  .mean()
  .clip(studyArea)
   .updateMask(floodMask);
}

var pre  = getMeanNTL('2022-04-01', '2022-05-31');
var post = getMeanNTL('2022-06-15', '2022-07-05');  
var rec  = getMeanNTL('2023-01-01', '2023-06-30'); 


var ntlRecovery = rec.subtract(post)
  .divide(pre.add(0.1)) 
  .rename('NTL_Recovery');



var pop = ee.ImageCollection("WorldPop/GP/100m/pop").filterDate('2020').mean();
var popDensity = pop.rename('PopDensity')
                 .clip(studyArea)
                 .updateMask(floodMask);


var rwi = ee.FeatureCollection("projects/sat-io/open-datasets/facebook/relative_wealth_index")
  .filterBounds(floodMask.geometry());


var ghsl = ee.ImageCollection("JRC/GHSL/P2023A/GHS_BUILT_C").first();

var roads = ghsl.select('built_characteristics').eq(5);

var roadDensity = roads.reduceNeighborhood({
  reducer: ee.Reducer.mean(),
  kernel: ee.Kernel.circle(500, 'meters'),
})
  .rename('RoadDensity')
  .clip(studyArea)
  .updateMask(floodMask);



var stack = ntlRecovery
  .addBands(popDensity)
  .addBands(roadDensity);

var regressionData = stack.sampleRegions({
  collection: rwi,  
  properties: ['rwi'],   
  scale: 100,            
  geometries: true       
}).map(function(f) {
  return f.set('constant', 1);
}).filter(ee.Filter.notNull(['NTL_Recovery', 'PopDensity', 'rwi', 'RoadDensity'])); 


var result = regressionData.reduceColumns({
  reducer: ee.Reducer.linearRegression({numX: 4, numY: 1}),

  selectors: ['constant', 'PopDensity', 'rwi', 'RoadDensity', 'NTL_Recovery']
});



var coefficients = ee.Array(result.get('coefficients')).transpose();

print('--- Regression Results ---');
print('Intercept (β0):', coefficients.get([0,0]));
print('PopDensity Coeff (β1):', coefficients.get([0,1]));
print('Wealth (RWI) Coeff (β2):', coefficients.get([0,2])); 
print('RoadDensity Coeff (β3):', coefficients.get([0,3]));


Map.addLayer(ntlRecovery, {min: -0.5, max: 0.5, palette: ['red', 'white', 'green']}, 'NTL Recovery Index');
Map.addLayer(popDensity, {min: 0, max: 50, palette: ['white', 'purple']}, 'Population Density');
Map.addLayer(floodMask, {palette: 'blue'}, 'Flood Mask');



 Export.table.toDrive({
   collection: regressionData,
   description: 'Sunamganj_SocioEconomic_Recovery_Table',
   fileFormat: 'CSV'
 });
 
 Export.image.toDrive({
  image: ntlRecovery.updateMask(floodMask),
  description: 'NTL_Recovery_Final_Map',
  scale: 500,
  region: floodMask.geometry(),
  maxPixels: 1e13
});
 
