import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const axiosCurrentWeather = ({ authorizationKey, locationName }) => {
  // console.log(authorizationKey,"authorizationKey")
  // console.log(locationName,"locationName")
  return axios.get(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`).then((response) => {
    const locationData = response.data.records.location[0];
    const weatherElements = locationData.weatherElement.reduce(
      (neededElements, item) => {
        if (["WDSD", "TEMP"].includes(item.elementName)) {
          neededElements[item.elementName] = item.elementValue;
        }
        return neededElements;
      },
      {}
    );
    return {
      observationTime: locationData.time.obsTime,
      locationName: locationData.locationName,
      temperature: weatherElements.TEMP,
      windSpeed: weatherElements.WDSD,
    };
    // console.log(weatherElements);
  });
};

const axiosWeatherForecast = ({ authorizationKey, cityName }) => {
  return axios.get(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`).then((response) => {
    const thirtySixData = response.data.records.location[0];
    const weatherElements = thirtySixData.weatherElement.reduce(
      (neededElements, item) => {
        if (["Wx", "PoP", "CI"].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
      },
      {}
    );
    return {
      description: weatherElements.Wx.parameterName,
      weatherCode: weatherElements.Wx.parameterValue,
      rainPossibility: weatherElements.PoP.parameterName,
      comfortability: weatherElements.CI.parameterName,
    };
  });
};

const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {

  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true,
  });

  const axiosData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    const [currentWeather, weatherForecast] = await Promise.all([
      axiosCurrentWeather({ authorizationKey, locationName }),
      axiosWeatherForecast({ authorizationKey, cityName }),
    ]);

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    });
  }, [locationName, cityName, authorizationKey]);

  useEffect(() => {
    axiosData();
  }, [axiosData]);

  return [weatherElement, axiosData];
};

export default useWeatherAPI;
