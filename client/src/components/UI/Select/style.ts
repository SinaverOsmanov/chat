import styled from "styled-components";

export const Style = styled.div`
  height: 48px;
  width: 170px;
  font-weight: 500;
  
  
  .ant-select {
    height: 100%;
    width: 100%;
  }

  .ant-select-arrow {
    display: none;
  }
  
  .ant-select-selector {
    width: 100% !important;
    height: 100% !important;
    border-radius: 5px;
    position: relative;

    border: 2px solid #cccccc !important;
    padding: 7px 10px 10px !important;

    margin: 0;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    -webkit-appearance: none !important;
    -moz-appearance: none !important;

    background-image: url('/assets/png/arrow-down.png');
    background-position: calc(100% - 15px) 50%;
    background-size: 9.6px 6px;
    background-repeat: no-repeat;
    
    & option {
      width: 100%;
    }
  }
`
