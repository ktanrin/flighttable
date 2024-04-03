<template>
  <div>
    <!-- Tabs for FlightTable, GroundNorth, and GroundSouth -->
    <div class="tabs is-centered is-toggle">
      <ul>
        <li @click="activeTab = 'FlightTable'" :class="{ 'is-active': activeTab === 'FlightTable' }"><a>All Ground</a></li>
        <li @click="activeTab = 'GroundNorth'" :class="{ 'is-active': activeTab === 'GroundNorth' }"><a>Ground North</a></li>
        <li @click="activeTab = 'GroundSouth'" :class="{ 'is-active': activeTab === 'GroundSouth' }"><a>Ground South</a></li>
      </ul> 
    </div>
    
    <div>
    <DigitalClock/>
    </div>

    <!-- Display the selected tab's content -->
    <div v-if="activeTab === 'FlightTable'">
      <FlightTable :flights="flightData" />
    </div>
    <div v-else-if="activeTab === 'GroundNorth'">
      <GroundNorth :flights="flightData" />
    </div>
    <div v-else-if="activeTab === 'GroundSouth'">
      <GroundSouth :flights="flightData" />
    </div>
  </div>
</template>

<script>
import DigitalClock from './components/DigitalClock.vue'
import FlightTable from "./components/FlightTable.vue";
import GroundNorth from "./components/GroundNorth.vue";
import GroundSouth from "./components/GroundSouth.vue";

export default {
  data() {
    return {
      activeTab: "FlightTable", // Default active tab
      flightData: [], // Store all flight data here
    };
  },
  methods: {
  //   async authenticateAndGetToken(){
  //     const response = await fetch('https://atfm.aerothai.aero/Account/Login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         username: 'admin',
  //         password: 'aerothai',
  //       }),
  //     });
  //     const data = await response.json();
  //     console.log('Authenticated and got token:', data.token);
  //     return data.token;
  //   },
    
  //   async fetchDataWithToken(token){
  //     const response = await fetch('https://atfm.aerothai.aero/IDEPATCO/GetATCOData?Airport=VTBD&TimeMode=UTC', {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     // Other headers as needed
  //   },
  // });

  //     const data = await response.json();
  //     return data;
  //   },

    async fetchFlightData() {
      try {
        const response = await fetch('https://atfm.aerothai.aero/IDEPATCO/GetAirlineData?Airport=VTBD');
        const data = await response.json();
        //const token = await this.authenticateAndGetToken(); // Authenticate to get the token
        //const data = await this.fetchDataWithToken(token);
        this.flightData = data;
        let now = new Date().toLocaleTimeString();
        console.log('Time', now ,'Fetched flight data from server:', this.flightData);
        
      } catch (error) {
        console.error('Error fetching flight data:', error);
      }
    }
  },
  mounted() {
    this.fetchFlightData();

    this.fetchInterval = setInterval(() => {
        this.fetchFlightData();
    }, 5000);
  },


  components: {
    DigitalClock,
    FlightTable,
    GroundNorth,
    GroundSouth,
  },
};
</script>

<style>
/* Import and apply Bulma styles */
@import '~bulma/css/bulma.css';

/* Remove extra space under the tabs bar */
.tabs.is-centered.is-toggle {
  margin-bottom: 0;
}

.tabs.is-toggle li.is-active a {
    background-color: hsl(207, 61%, 53%);
    border-color: hsl(207, 61%, 53%);
    color: #fff;
    z-index: 1;
}

a{
  font-weight: bold;
  font-size: 3.975vw !important;
}

/* Center the text within table cells (td) */
td {
  text-align: center;
}

/* Remove borders within the TSAT cell */
.tsat-cell {
  padding: 0;
  border: none;
}

/* Add custom styles for the TSAT window text */
.tsat-window {
  font-size: 75%;
  color: grey;
}
</style>
