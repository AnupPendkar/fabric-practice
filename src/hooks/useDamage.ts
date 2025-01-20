import { useState } from "react";
import AxiosHttpClient from "../shared/AxiosClient";
import { ApiRoutesEnum } from "../shared/apiRoutes";
import {
  ContainerSideInfo,
  ContainerSideSegmentInfo,
} from "@/typings/damage-controller.typing";
import { isPropEmpty } from "@/utils/CommonUtils";

const useDamage = () => {
  const damageConfig = {
    entity_id: "L2bR3thrZ",
    transaction_id: "1737374539",
    container_number: "PAGU1799720",
  };
  const dynamicUrl = "http://172.16.120.24:7005";

  function fetchDamageConfig(): Promise<any> {
    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .get(ApiRoutesEnum.damageConfig)
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            resolve(res?.data?.damage);
          }
        });
    });
  }

  function fetchDamageSidePerceptionInfo(data?: any): any {
    const params = {
      entity_id: damageConfig?.entity_id,
      transaction_id: damageConfig?.transaction_id,
      container_number: damageConfig?.container_number,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .get(ApiRoutesEnum.containerSidePerspectiveInfo, {
          params,
        })
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            resolve(res?.data);
          }
        });
    });
  }

  function fetchContainerSideInfo(data): any {
    const params = {
      entity_id: damageConfig?.entity_id,
      transaction_id: damageConfig?.transaction_id,
      container_number: damageConfig?.container_number,
      side: data?.side as string,
      side_id: data?.side_id as string,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .get(ApiRoutesEnum.containerSideInfo, { params })
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            const responseData = res?.data as ContainerSideInfo;

            if (isPropEmpty(responseData.stitched_image_path)) {
              responseData.stitched_image_path =
                "damage-contoller/dummy_container.png";
            } else {
              responseData.stitched_image_path =
                responseData.stitched_image_path
                  ? dynamicUrl + responseData.stitched_image_path
                  : responseData.stitched_image_path;
            }

            responseData.heatmap_image_path = responseData.heatmap_image_path
              ? dynamicUrl + responseData.heatmap_image_path
              : responseData.heatmap_image_path;
            responseData.major_heatmap_image_path =
              responseData.major_heatmap_image_path
                ? dynamicUrl + responseData.major_heatmap_image_path
                : responseData.major_heatmap_image_path;

            resolve(responseData);
          }
        });
    });
  }

  function fetchSideSegmentInfo(data): any {
    const params = {
      transaction_id: damageConfig?.transaction_id,
      entity_id: damageConfig?.entity_id,
      container_number: damageConfig?.container_number,
      side: data?.side,
      segment_id: data?.segment_id,
      side_id: data?.side_id,
      is_minor_enabled: data.is_minor_enabled,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .get(ApiRoutesEnum.containerSideSegmentInfo, { params })
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            const responseData = res?.data as ContainerSideSegmentInfo;
            responseData.segment_image_path =
              dynamicUrl + responseData.segment_image_path;

            resolve(responseData);
          }
        });
    });
  }

  function addContainerDamage(data): any {
    const payload = {
      transaction_id: damageConfig?.transaction_id,
      entity_id: damageConfig?.entity_id,
      container_number: damageConfig?.container_number,
      side: data?.side,
      segment_id: data?.segment_id,
      side_id: data?.side_id,
      damages: data?.damages,
      is_minor_enabled: data.is_minor_enabled,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .post(ApiRoutesEnum.containerDamage, payload)
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            resolve(res?.data);
          }
        });
    });
  }

  function deleteContainerDamage(data): any {
    const payload = {
      transaction_id: damageConfig?.transaction_id,
      entity_id: damageConfig?.entity_id,
      container_number: damageConfig?.container_number,
      side: data?.side,
      segment_id: data?.segment_id,
      side_id: data?.side_id,
      damages: data?.damages,
      is_minor_enabled: data.is_minor_enabled,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .delete(ApiRoutesEnum.containerDamage, {
          data: payload,
        })
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            resolve(res?.data);
          }
        });
    });
  }

  function updateContainerDamage(data): any {
    const payload = {
      transaction_id: damageConfig?.transaction_id,
      entity_id: damageConfig?.entity_id,
      container_number: damageConfig?.container_number,
      side: data?.side,
      segment_id: data?.segment_id,
      side_id: data?.side_id,
      damages: data?.damages,
      is_minor_enabled: data.is_minor_enabled,
    };

    return new Promise((resolve) => {
      AxiosHttpClient.request()
        .put(ApiRoutesEnum.containerDamage, payload)
        .then((res) => {
          if ([200, 201, 204].includes(res?.status)) {
            resolve(res?.data);
          }
        });
    });
  }

  return {
    fetchDamageConfig,
    fetchDamageSidePerceptionInfo,
    fetchContainerSideInfo,
    fetchSideSegmentInfo,
    addContainerDamage,
    deleteContainerDamage,
    updateContainerDamage,
  };
};

export default useDamage;
