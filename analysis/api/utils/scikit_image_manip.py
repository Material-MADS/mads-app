#=================================================================================================
# Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
#          Hokkaido University (2018)
# ________________________________________________________________________________________________
# Authors: Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
# ________________________________________________________________________________________________
# Description: Serverside (Django) rest api utils for the 'Analysis' page involving
#              pie components
# ------------------------------------------------------------------------------------------------
# Notes:  This is one of the REST API parts of the 'analysis' interface of the website that
#         allows serverside work for the 'pie' component.
# ------------------------------------------------------------------------------------------------
# References: logging, numpy libs
#=================================================================================================

#-------------------------------------------------------------------------------------------------
# Import required Libraries
#-------------------------------------------------------------------------------------------------
from colorsys import hsv_to_rgb
from ctypes import resize
import logging
import numpy as np
from PIL import Image
from io import BytesIO
import base64
import scipy
import skimage

logger = logging.getLogger(__name__)
#-------------------------------------------------------------------------------------------------


#-------------------------------------------------------------------------------------------------
def get_scikit_image_manip(data):
    imgOpts = data['view']['settings']['options']

    # If scikit-image manipulation is requested .skImg.isEnabled
    if imgOpts['skImg']['isEnabled'] == True:
        # Convert base64 image string to numpy image array
        imageData = data['data']['origin']
        if imgOpts['skImg']['applyToCurrentEnable'] == True and data['data']['manipVer'] != "":
            imageData = data['data']['manipVer']
        base64_image_string = imageData.split("base64,")[1]
        image = Image.open(BytesIO(base64.b64decode(base64_image_string)))
        img = np.array(image)
        workingImg = np.copy(img)
        resultImg = None
        no_of_changes = 0

        if len(workingImg.shape) == 2:
            workingImg = skimage.color.gray2rgb(workingImg)
            workingImg = workingImg[:,:,:3]
        if workingImg.shape[2] == 4:
            workingImg = skimage.color.rgba2rgb(workingImg)
            workingImg = workingImg[:,:,:3]




        # 1. GRAYSCALE  (dType Out: float64)
        if imgOpts['skImg']['grayscaleEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.color.rgb2gray(workingImg)


        # 2. ROTATE  (dType Out: float64)
        if imgOpts['skImg']['rotateEnabled'] == True:
            no_of_changes = no_of_changes + 1
            rotAngle = int(imgOpts['skImg']['rotateAngle'])
            resizeOn = imgOpts['skImg']['rotateResizeEnable']
            workingImg = skimage.transform.rotate(workingImg, rotAngle, resize=resizeOn)


        # 3. EDGE DETECTOR (CANNY ALGORITHM)    (dType Out: uint8)
        if imgOpts['skImg']['edgeDetectEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.color.rgb2gray(workingImg)
            sigmaVal = float(imgOpts['skImg']['edgeDetectSigma'])
            edgeImg = skimage.feature.canny(workingImg, sigma=sigmaVal)
            edgeImg = edgeImg.astype(np.uint8) * 255
            workingImg = edgeImg


        # 4. COLOR TINTING    (dType Out: int64 ==> uint8)
        if imgOpts['skImg']['colorTintEnabled'] == True:
            no_of_changes = no_of_changes + 1
            tint_image = workingImg
            if len(tint_image.shape) == 2:
                tint_image = skimage.color.gray2rgb(tint_image)
            tintChoice = ({ "Red": [1,0,0], "Green": [0,1,0], "Blue": [0,0,1], "Yellow": [1,1,0], "Pink": [1,0,1], "Cyan": [0,1,1] })[imgOpts['skImg']['colorTintColor']]
            workingImg = tint_image * tintChoice
            workingImg = workingImg.astype(np.uint8)


        # 5. INVERT  (dType Out: uint8)
        if imgOpts['skImg']['invertEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.util.invert(workingImg)


        # 6. GAMMA CORRECTION (lighter < 1 = normal < darker)   (dType Out: uint8)
        if imgOpts['skImg']['gammaChangeEnabled'] == True:
            no_of_changes = no_of_changes + 1
            gammaVal = float(imgOpts['skImg']['gammaValue'])
            gamma_corrected = skimage.exposure.adjust_gamma(workingImg, gammaVal)
            workingImg = gamma_corrected


        # 7. ENHANCE LOW CONTRAST IMAGE (Adaptive Equalization)   (dType Out: float64)
        if imgOpts['skImg']['enhanceContrastEnabled'] == True:
            no_of_changes = no_of_changes + 1
            clipLimitVal = float(imgOpts['skImg']['enhanceContrastClipLimitValue'])
            contrastImg_adapteq = skimage.exposure.equalize_adapthist(workingImg, clip_limit=clipLimitVal)
            workingImg = contrastImg_adapteq


        # 8. SHARPEN      (dType Out: float64)
        if imgOpts['skImg']['sharpenEnabled'] == True:
            no_of_changes = no_of_changes + 1
            radiusVal = float(imgOpts['skImg']['sharpenRadiusValue'])
            amountVal = float(imgOpts['skImg']['sharpenAmountValue'])
            sharpenedImg = skimage.filters.unsharp_mask(workingImg, radius=radiusVal, amount=amountVal)
            workingImg = sharpenedImg


        # 9. DENOISER      (dType Out: float64)
        if imgOpts['skImg']['denoiseEnabled'] == True:
            no_of_changes = no_of_changes + 1
            denoised_output = skimage.restoration.denoise_bilateral(workingImg, sigma_color=0.05, sigma_spatial=15, channel_axis=-1)
            workingImg = denoised_output


        # 10. EROSION, HOLES & PEAKS  (dType Out: float64)
        if imgOpts['skImg']['erosionEnabled'] == True:
            no_of_changes = no_of_changes + 1
            mask = workingImg
            if imgOpts['skImg']['erosionOpt'] == "Erosion" or imgOpts['skImg']['erosionOpt'] == "Holes":
                seed = np.copy(workingImg)
                seed[1:-1, 1:-1] = workingImg.max()
                erodedImg = skimage.morphology.reconstruction(seed, mask, method='erosion')
                if imgOpts['skImg']['erosionOpt'] == "Holes":
                    workingImg = workingImg - erodedImg
                else:
                    workingImg = erodedImg
            elif imgOpts['skImg']['erosionOpt'] == "Peaks":
                dilSeed = np.copy(workingImg)
                dilSeed[1:-1, 1:-1] = workingImg.min()
                dilationImg = skimage.morphology.reconstruction(dilSeed, mask, method='dilation')
                workingImg = workingImg - dilationImg
            workingImg = skimage.exposure.rescale_intensity(workingImg, out_range=(0, 1))


        # 11. HSV - HUE SATURATION VALUE  (dType Out: float64)
        if imgOpts['skImg']['hueSatValEnabled'] == True:
            no_of_changes = no_of_changes + 1
            hsv_img = skimage.color.rgb2hsv(workingImg)
            # Hue
            hue_img = hsv_img[:, :, 0]
            hue_threshold = float(imgOpts['skImg']['HSV_HueValue'])
            hue_img = hue_img - hue_threshold
            hsv_img[:, :, 0] = hue_img
            # Saturation
            sat_img = hsv_img[:, :, 1]
            sat_threshold = float(imgOpts['skImg']['HSV_SaturationValue'])
            sat_img = sat_img - sat_threshold
            sat_img = sat_img.clip(0, 1)
            hsv_img[:, :, 1] = sat_img
            # Value (light/dark)
            value_img = hsv_img[:, :, 2]
            value_threshold = float(imgOpts['skImg']['HSV_ValueValue'])
            val_img = value_img - value_threshold
            hsv_img[:, :, 2] = val_img

            rgb_img = skimage.color.hsv2rgb(hsv_img)
            rgb_img = skimage.exposure.rescale_intensity(rgb_img, out_range=(0, 1))
            workingImg = rgb_img


        # 12. FILTERING REGIONAL MAXIMA  (dType Out: float64)
        if imgOpts['skImg']['regionMaxFilterEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.img_as_float(workingImg)
            workingImg = scipy.ndimage.gaussian_filter(workingImg, 1)
            seed = np.copy(workingImg)
            seed[1:-1, 1:-1] = workingImg.min()
            mask = workingImg
            dilated = skimage.morphology.reconstruction(seed, mask, method='dilation')
            workingImg = workingImg - dilated


        # 13. CONVEX HULL - The convex hull of a binary image is the set of pixels included in the smallest convex polygon that surround all white pixels in the input.  (dType Out: bool)
        if imgOpts['skImg']['convexHullEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.util.invert(workingImg)
            chull = skimage.morphology.convex_hull_image(workingImg)
            workingImg = chull


        # 14. RIDGE DETECTION  (dType Out: float64)
        if imgOpts['skImg']['ridgeDetectionEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.color.rgb2gray(workingImg)
            kwargs = {'sigmas': [1], 'mode': 'reflect', 'black_ridges': 1}
            if imgOpts['skImg']['ridgeDetectionFilter'] == "Meijering":
                ridgeDetectImg = skimage.filters.meijering(workingImg, **kwargs)
            elif imgOpts['skImg']['ridgeDetectionFilter'] == "Hessian":
                ridgeDetectImg = skimage.filters.hessian(workingImg, **kwargs)
            workingImg = ridgeDetectImg


        # 15. SWIRL     (dType Out: float64)
        if imgOpts['skImg']['swirlEnabled'] == True:
            no_of_changes = no_of_changes + 1
            strengtVal = float(imgOpts['skImg']['swirlStrengthValue'])
            radiusVal = float(imgOpts['skImg']['swirlRadiusValue'])
            swirled = skimage.transform.swirl(workingImg, strength=strengtVal, radius=radiusVal)
            workingImg = swirled


        # 16. RAG (Region Adjacency Graph) Thresholding & Merging      (dType Out: float64)
        if imgOpts['skImg']['ragThresholdEnabled'] == True:
            no_of_changes = no_of_changes + 1
            def _weight_mean_color(graph, src, dst, n):
                diff = graph.nodes[dst]['mean color'] - graph.nodes[n]['mean color']
                diff = np.linalg.norm(diff)
                return {'weight': diff}
            def merge_mean_color(graph, src, dst):
                graph.nodes[dst]['total color'] += graph.nodes[src]['total color']
                graph.nodes[dst]['pixel count'] += graph.nodes[src]['pixel count']
                graph.nodes[dst]['mean color'] = (graph.nodes[dst]['total color'] / graph.nodes[dst]['pixel count'])
            RAG_Img = np.empty_like(workingImg)
            RAG_Labels_1 = skimage.segmentation.slic(workingImg, compactness=30, n_segments=400, start_label=1)
            RAG_Mean_Color = skimage.graph.rag_mean_color(workingImg, RAG_Labels_1)
            if imgOpts['skImg']['ragThresholdVersion'] == "Threshold 1":
                RAG_Img = skimage.color.label2rgb(RAG_Labels_1, workingImg, kind='avg', bg_label=0)
            elif imgOpts['skImg']['ragThresholdVersion'] == "Threshold 2":
                RAG_Labels_2 = skimage.graph.cut_threshold(RAG_Labels_1, RAG_Mean_Color, 29)
                RAG_Img = skimage.color.label2rgb(RAG_Labels_2, workingImg, kind='avg', bg_label=0)
            elif imgOpts['skImg']['ragThresholdVersion'] == "Merging":
                RAG_Labels_3 = skimage.graph.merge_hierarchical(RAG_Labels_1, RAG_Mean_Color, thresh=35, rag_copy=False, in_place_merge=True, merge_func=merge_mean_color, weight_func=_weight_mean_color)
                RAG_Img = skimage.color.label2rgb(RAG_Labels_3, workingImg, kind='avg', bg_label=0)
                RAG_Img = skimage.segmentation.mark_boundaries(RAG_Img, RAG_Labels_3, (0, 0, 0))
            workingImg = RAG_Img


        # 17. THRESHOLDING (MULTI-OTSU & BINARY)  (dType Out: float64)
        if imgOpts['skImg']['thresholdingEnabled'] == True:
            no_of_changes = no_of_changes + 1
            if imgOpts['skImg']['thresholdingVersion'] == "Multi-Otsu":
                thresholds_MU = skimage.filters.threshold_multiotsu(workingImg)
                thresholdImg_MURegions = np.digitize(workingImg, bins=thresholds_MU)
                thresholdImg_MURegions = skimage.exposure.rescale_intensity(thresholdImg_MURegions, out_range=(0,1))
                workingImg = thresholdImg_MURegions
            elif imgOpts['skImg']['thresholdingVersion'] == "Binary":
                workingImg = skimage.color.rgb2gray(workingImg)
                thresholds_bin = skimage.filters.threshold_otsu(workingImg)
                thresholdImg_Binary = workingImg > thresholds_bin
                workingImg = thresholdImg_Binary


        # 18. SEGMENTATION (Chan-Vese)     (dType Out: uint8)
        if imgOpts['skImg']['CVSegmentationEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.color.rgb2gray(workingImg)
            workingImg = skimage.img_as_float(workingImg)
            cvImg = skimage.segmentation.chan_vese(workingImg, mu=0.25, lambda1=1, lambda2=1, tol=1e-3, max_num_iter=200, dt=0.5, init_level_set="checkerboard", extended_output=True)
            workingImg = cvImg[0]
            # workingImg = skimage.exposure.rescale_intensity(cv[1], in_range=(0, 1))
            workingImg = workingImg.astype(np.uint8) * 255


        # 19. SWITCH COLOR  (dType Out: uint8)
        if imgOpts['skImg']['switchColorEnabled'] == True:
            no_of_changes = no_of_changes + 1
            extendRangeValue = int(imgOpts['skImg']['switchColorExtendRangeValue'])
            frRed, frGreen, frBlue = bytes.fromhex(imgOpts['skImg']['switchColorFromColor'].split("#")[1])
            toRed, toGreen, toBlue = bytes.fromhex(imgOpts['skImg']['switchColorToColor'].split("#")[1])

            if (extendRangeValue > 0):
                frRedRange = range(max(frRed-extendRangeValue, 0),min(frRed+extendRangeValue, 255))
                frGreenRange = range(max(frGreen-extendRangeValue, 0),min(frGreen+extendRangeValue, 255))
                frBlueRange = range(max(frBlue-extendRangeValue, 0),min(frBlue+extendRangeValue, 255))
                for r in frRedRange:
                    for g in frGreenRange:
                        for b in frBlueRange:
                            workingImg[np.all(workingImg == (r, g, b), axis=-1)] = (toRed,toGreen,toBlue)
            else:
                workingImg[np.all(workingImg == (frRed, frGreen, frBlue), axis=-1)] = (toRed,toGreen,toBlue)


        # 20. FLIP  (dType Out: uint8)
        if imgOpts['skImg']['flipEnabled'] == True:
            no_of_changes = no_of_changes + 1
            if imgOpts['skImg']['flipHorizontallyEnabled'] == True:
                workingImg = workingImg[:, ::-1]
            if imgOpts['skImg']['flipVerticallyEnabled'] == True:
                workingImg = workingImg[::-1,:,:]


        # 21. CIRCLE FRAME  (dType Out: uint8)
        if imgOpts['skImg']['circleFrameEnabled'] == True:
            no_of_changes = no_of_changes + 1
            def create_circular_mask(h, w, center=None, radius=None):
                if center is None: # use the middle of the image
                    center = (int(w/2), int(h/2))
                if radius is None: # use the smallest distance between the center and image walls
                    radius = min(center[0], center[1], w-center[0], h-center[1])

                Y, X = np.ogrid[:h, :w]
                dist_from_center = np.sqrt((X - center[0])**2 + (Y-center[1])**2)
                mask = dist_from_center <= radius
                return mask

            h, w = workingImg.shape[:2]
            centerH = int(imgOpts['skImg']['circleFrameCenterH'])
            centerV = int(imgOpts['skImg']['circleFrameCenterV'])
            radius = int(imgOpts['skImg']['circleFrameRadius'])
            mask = create_circular_mask(h, w, center=(centerH, centerV), radius=radius)
            workingImg[~mask] = 0


        # 22. SKELETONIZE     (dType Out: uint8)
        if imgOpts['skImg']['skeletonizeEnabled'] == True:
            no_of_changes = no_of_changes + 1
            workingImg = skimage.util.invert(workingImg)
            skeleton = skimage.morphology.skeletonize(workingImg)
            workingImg = skeleton


        # 23. OBJECT DETECTION - Histogram of Oriented Gradients HOG  (dType Out: float64)
        if imgOpts['skImg']['objectDetectionEnabled'] == True:
            no_of_changes = no_of_changes + 1
            fd, hog_image = skimage.feature.hog(workingImg, orientations=8, pixels_per_cell=(16, 16), cells_per_block=(1, 1), visualize=True, channel_axis=-1)
            hog_image_rescaled = skimage.exposure.rescale_intensity(hog_image, in_range=(-10, 10))
            workingImg = hog_image_rescaled


        # 24. CONTOUR FINDING  (dType Out: )
        if imgOpts['skImg']['contourFindingEnabled'] == True:
            no_of_changes = no_of_changes + 1
            contourFindingLevel = float(imgOpts['skImg']['contourFindingLevel'])
            contourOnlyEnabled = imgOpts['skImg']['contourOnlyEnabled']
            contourPoppingEnabled = imgOpts['skImg']['contourPoppingEnabled']

            contours = skimage.measure.find_contours(skimage.color.rgb2gray(workingImg), contourFindingLevel)

            baseImg = Image.fromarray(skimage.img_as_ubyte(workingImg)).convert('RGBA')
            h, w, c =  np.array(baseImg.copy()).shape
            combined_mask = 255 * np.zeros(shape=(h, w, c), dtype=np.uint8)
            for c in contours:
                c_mask = np.zeros_like(workingImg, dtype='bool')
                c_mask[np.round(c[:, 0]).astype('int'), np.round(c[:, 1]).astype('int')] = 1
                c_mask = scipy.ndimage.binary_fill_holes(c_mask)
                c_mask = ~c_mask

                if(contourPoppingEnabled):
                    c_mask = skimage.filters.hessian(c_mask, sigmas=[3], mode='constant', black_ridges=True)

                color = np.random.randint(255, size=3)
                overlayImg = Image.fromarray(skimage.img_as_ubyte(c_mask)).convert("RGBA")
                oi_data = overlayImg.getdata()
                newData = []
                for item in oi_data:
                    if item[0] == 255 and item[1] == 255 and item[2] == 255:
                        newData.append((255, 255, 255, 0))
                    else:
                        newData.append((color[0], color[1], color[2], 255))

                overlayImg.putdata(newData)
                combined_mask += np.array(overlayImg)

            if contourOnlyEnabled == True:
                workingImg = combined_mask
            else:
                mergedImg = Image.alpha_composite(baseImg, Image.fromarray(skimage.img_as_ubyte(combined_mask)).convert("RGBA"))
                workingImg = mergedImg

        # 25. FLORESCENT COLORING  (dType Out: )
        if imgOpts['skImg']['florescentColorsEnabled'] == True:
            no_of_changes = no_of_changes + 1
            ihc_rgb = workingImg
            ihc_hed = skimage.color.rgb2hed(ihc_rgb)
            null = np.zeros_like(ihc_hed[:, :, 0])
            h = skimage.exposure.rescale_intensity(ihc_hed[:, :, 0], out_range=(0, 1), in_range=(0, np.percentile(ihc_hed[:, :, 0], 99)))
            d = skimage.exposure.rescale_intensity(ihc_hed[:, :, 2], out_range=(0, 1), in_range=(0, np.percentile(ihc_hed[:, :, 2], 99)))
            zdh = np.dstack((null, d, h))
            workingImg = zdh


        if no_of_changes > 0:
            resultImg = workingImg
        elif no_of_changes == 0 and imgOpts['skImg']['applyToCurrentEnable'] != True and (hasattr(data['data'], 'manipVer') and data['data']['manipVer'] != ""):
            resultImg = img
        else:
            data['data']['manipVer'] = data['data']['origin']


        # Convert numpy image array to base64 image string
        if resultImg is not None:
            with BytesIO() as output_bytes:
                PIL_image = Image.fromarray(skimage.img_as_ubyte(resultImg))
                imgStrStart = "data:image/jpeg;base64,"
                try:
                    PIL_image.save(output_bytes, 'JPEG') # Note JPG is not a vaild type here
                except:
                    try:
                        PIL_image.save(output_bytes, 'PNG')
                        imgStrStart = "data:image/png;base64,"
                    except:
                        logger.info("An exception occurred when saving image")
                bytes_data = output_bytes.getvalue()

            new_image_string = imgStrStart + str(base64.b64encode(bytes_data), 'utf-8')
            data['data']['manipVer'] = new_image_string

        return data['data']

    # Else If not
    return {}
#-------------------------------------------------------------------------------------------------
