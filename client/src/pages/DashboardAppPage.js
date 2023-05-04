import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
import React, { useContext, useState } from 'react';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';

// components
import { WiHumidity } from 'react-icons/wi';
import GeneralContext from '../context/generalProvider';
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const [temp, setTemp] = useState('0');
  const [hum, setHum] = useState('0');
  const [hex, setHex] = useState('0');
  const [rgb, setRgb] = useState('Red');
  const [listTemp, setListTemp] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const { socket } = useContext(GeneralContext);
  const theme = useTheme();
  const [lightOn, setLightOn] = React.useState(false);

  socket.on('temp', (data) => {
    let tempArr = [...listTemp];
    tempArr.unshift(Number(data));

    tempArr = tempArr.slice(0, tempArr.length - 1);
    console.log(tempArr);
    setListTemp(tempArr);
    setTemp(data);
  });

  socket.on('hum', (data) => {
    setHum(data);
  });

  socket.on('hex', (data) => {
    setHex(data);
  });

  function handleClick() {
    socket.emit('light-on', !lightOn);
    setLightOn(!lightOn);
  }
  function valueFan(e) {
    socket.emit('fan', e.target.value);
  }

  function handleColorChange(e) {
    socket.emit('rgb', e.target.value);
    setRgb(e.target.value);
  }

  async function openFace() {
    const res = await axios.get('http://localhost:3001/face');
    console.log(res);
  }

  async function openVoice() {
    const res = await axios.get('http://localhost:3001/voice');
    console.log(res);
  }

  return (
    <>
      <Helmet>
        <title> Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Light" total={`${hex}`} icon={`mdi:alarm-light${!lightOn ? '-off' : ''}`} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Humidity" total={`${hum}%`} color="info" icon={'wi:humidity'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Led_RGB" total={`${rgb}`} color="warning" icon={'ic:baseline-color-lens'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Temperature" total={`${temp}℃`} color="error" icon={'mdi:temperature'} />
          </Grid>

          <Grid item xs={12} md={6} lg={12}>
            <div className="body-dashboard">
              <div className="body-dashboard_items">
                <div style={{ width: '12rem', display: 'flex', justifyContent: 'space-between' }}>
                  Light (On - Off) <div>:</div>
                </div>
                <div>
                  <Switch checked={lightOn} onChange={() => handleClick()} name="loading" color="primary" />
                </div>
              </div>
              <div className="body-dashboard_items">
                <div style={{ width: '12rem', display: 'flex', justifyContent: 'space-between' }}>
                  Fan (0 - 100) <div>:</div>{' '}
                </div>
                <div style={{ width: '25rem', paddingTop: '1rem' }}>
                  <Slider
                    aria-label="Temperature"
                    defaultValue={0}
                    onChange={(e) => valueFan(e)}
                    valueLabelDisplay="auto"
                    step={10}
                    marks
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div className="body-dashboard_items">
                <div style={{ width: '12rem', display: 'flex', justifyContent: 'space-between' }}>
                  Color (R - G - B) <div>:</div>{' '}
                </div>
                <div>
                  <FormControl
                    onChange={(e) => {
                      handleColorChange(e);
                    }}
                  >
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={rgb}
                    >
                      <FormControlLabel value="Red" control={<Radio />} label="Red" />
                      <FormControlLabel value="Green" control={<Radio />} label="Green" />
                      <FormControlLabel value="Blue" control={<Radio />} label="Blue" />
                    </RadioGroup>
                  </FormControl>
                </div>
              </div>

              <div className="body-dashboard_items">
                <div style={{ width: '12rem', display: 'flex', justifyContent: 'space-between' }}>
                  Face Detect <div>:</div>{' '}
                </div>{' '}
                <Button
                  onClick={() => {
                    openFace();
                  }}
                  variant="contained"
                >
                  Execute
                </Button>
              </div>
              <div className="body-dashboard_items">
                <div style={{ width: '12rem', display: 'flex', justifyContent: 'space-between' }}>
                  Voice Detect <div>:</div>{' '}
                </div>{' '}
                <Button
                  onClick={() => {
                    openVoice();
                  }}
                  variant="contained"
                >
                  Execute
                </Button>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6} lg={12}>
            <AppWebsiteVisits
              title="Temperature Statistic"
              chartLabels={[
                '05/04/2022',
                '05/05/2022',
                '05/06/2022',
                '05/07/2022',
                '05/08/2022',
                '05/09/2022',
                '05/10/2022',
                '05/11/2022',
                '05/12/2022',
                '05/13/2022',
                '05/14/2022',
              ]}
              chartData={[
                {
                  name: 'Temperature',
                  type: 'column',
                  fill: 'solid',
                  data: listTemp,
                },
                {
                  name: 'Temperature',
                  type: 'area',
                  fill: 'gradient',
                  data: listTemp,
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
