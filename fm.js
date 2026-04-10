var district = table.filter(ee.Filter.eq("NAME_2","Sun Amgonj"))
Map.addLayer(district)
var collectionVV = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass','DESCENDING')) 
  .filterMetadata('resolution_meters','equals', 10)
  .filterBounds(district)
  .select('VV');
  
var collectionVH = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.eq('orbitProperties_pass','DESCENDING')) 
  .filterMetadata('resolution_meters','equals', 10)
  .filterBounds(district)
  .select('VH');  
  
print(collectionVV, 'VV Collection');
print(collectionVH, 'VH Collection'); 


var beforeVV = collectionVV.filterDate('2022-05-11', '2022-06-10').max().clip(district);
var afterVV = collectionVV.filterDate("2022-06-11", "2022-07-10").max().clip(district);
var beforeVH = collectionVH.filterDate('2022-05-11', '2022-06-10').max().clip(district);
var afterVH = collectionVH.filterDate("2022-06-11", "2022-07-10").max().clip(district);

var smothing_radius = 50;

beforeVV = beforeVV.focal_mean(smothing_radius, 'circle', 'meters');
afterVV = afterVV.focal_mean(smothing_radius, 'circle', 'meters');
beforeVH = beforeVH.focal_mean(smothing_radius, 'circle', 'meters');
afterVH = afterVH.focal_mean(smothing_radius, 'circle', 'meters');

var ratioVH = afterVH.divide(beforeVH);
var ratioVV = afterVV.divide(beforeVV);


var floodedCombined = ratioVH.gt(1.25).and(ratioVV.gt(1.2));
var floodedMasked = floodedCombined.updateMask(floodedCombined);

Map.addLayer(floodedMasked, {palette: "0000FF"}, 'Flooded Areas VV+VH', 1);
Map.addLayer(floodedCombined, {}, 'combined Flooded Areas VV+VH');
Map.addLayer(ratioVH, {min:0, max:2}, 'VH Ratio', 0);
Map.addLayer(ratioVV, {min:0, max:2}, 'VV Ratio', 0);


var pixelArea = ee.Image.pixelArea();
var floodedPixelArea = pixelArea.updateMask(floodedMasked);
var floodedArea = floodedPixelArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: district,
  scale: 10,
  maxPixels: 1e13
});

var floodedArea_m2 = floodedArea.get('area');
var floodedArea_km2 = ee.Number(floodedArea_m2).divide(1e6);
print('Total Flooded Area (m²):', floodedArea_m2);
print('Total Flooded Area (km²):', floodedArea_km2);

Export.image.toDrive({
  image: floodedMasked,
  description: 'Sunamganj_Flood_VV_VH_June2022',
  scale: 10,
  region: district,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: floodedCombined,
  description: 'Sunamganj_Flood_Extend_June2022',
  scale: 10,
  region: district,
  maxPixels: 1e13
});
