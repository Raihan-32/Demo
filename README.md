#Flood Extent Mapping and Socio-Economic Recovery Analysis Using Google Earth Engine.
Flood detection and post-disaster recovery assessment are critical for humanitarian response and urban planning. In this project, we demonstrate how to use Sentinel-1 SAR imagery to map flood extent and NASA VIIRS Night-time Light (NTL) data to calculate a recovery index for Sunamganj District, Bangladesh.
#Step 1: SAR Data Pre-processing
First, we filter the Sentinel-1 GRD collection for dual-polarization (VV + VH) and specific orbit properties (Descending). We compare "before" and "after" images to identify changes in surface backscatter.
#Step 2: Flood Detection & Masking
Next, we identify flooded areas by applying a threshold to the backscatter decrease. Water acts as a specular reflector, appearing significantly darker than land. We use .selfMask() to isolate only the inundated pixels for further analysis.


#Step 3: NTL Recovery Index Calculation
We calculate the Normalized Recovery Index using VIIRS NTL data. The formula compares pre-flood, peak-flood, and post-flood light intensity to measure how quickly electrification and economic activity returned to normal:Recovery = (Post - Peak)/(Pre + 0.1)

#Step 4: Socio-Economic Regression
Finally, we integrate the Relative Wealth Index (RWI), WorldPop (Population Density), and GHSL (Road Density) layers. We perform an Ordinary Least Squares (OLS) Regression to determine which factors most influenced recovery speed.
Case Study: Sunamganj Flood 2022We have mapped the flood extent for Sunamganj using Sentinel-1 imagery for June 2022 and analyzed recovery drivers. The results indicate that Road Density is the primary driver of restoration.

**I've prepared a flood extend map of Sunamganj(2002). Here are the links:**

[GEE LINK](https://code.earthengine.google.com/d1359a2175b851cd6c7639147fae0596)

[CODE LINK](https://github.com/Raihan-32/Assignment_9/blob/main/Flood_map_code.js)

[IMAGE LINK](https://github.com/Raihan-32/Assignment_9/blob/main/Map%20Collection/Flood_extend_map.png)


**According to the flood map I masked the flooded area and integrate different indexes to calculate NTL recovery index and illustrating 
the spatial distribution of it. Here is the outcome:**

[GEE LINK](https://code.earthengine.google.com/0c0f54fbd4a8845ed94e5aa569f3be4d)

[CODE LINK](https://github.com/Raihan-32/Assignment_9/blob/main/Recovery_index_code.js)

[IMAGE LINK](https://github.com/Raihan-32/Assignment_9/blob/main/Map%20Collection/NTL_recovery.jpg)



