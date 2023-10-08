<template>
  <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
      <tr>
        <th class="has-text-centered">Callsign</th>
        <th class="has-text-centered">Stand</th>
        <th class="has-text-centered">TSAT</th>
        <th class="has-text-centered">CTOT</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(flight, index) in filteredFlights" :key="index">
        <td class="has-text-centered">{{ flight.AircraftId }}</td>
        <td class="has-text-centered">{{ flight.DepartureGate }}</td>
        <td class="tsat-cell has-text-centered" :style="getTSATStyle(flight.TSATSTR)">
          <div>
            <span class="tsat-window">
              {{ getTSATWindow(flight.TSATSTR, -5) }}
            </span>
            {{ formatUTCDate(flight.TSATSTR) }}
            <span class="tsat-window">
              {{ getTSATWindow(flight.TSATSTR, 5) }}
            </span>
          </div>
        </td>
        <td class="has-text-centered">{{ formatUTCDate(flight.CTOTSTR) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    flights: {
      type: Array,
      default: () => []
    }
  },
  computed: {  
    filteredFlights() {
    const now = new Date();

    const validFlights = this.flights.filter((flight) => {

    if (flight.CTOTSTR !== '') {
        // Calculate tsat time based on ctot - exot - 5 minutes
        const ctotTime = this.parseHHMM(flight.CTOTSTR);
        const exotMinutes = parseInt(flight.EXOTSTR);
        const tsatTime = new Date(ctotTime - exotMinutes * 60 * 1000 - 5 * 60 * 1000);
        flight.TSATSTR = `${tsatTime.getHours().toString().padStart(2, '0')}${tsatTime.getMinutes().toString().padStart(2, '0')}`;
    }
    if (flight.TSATSTR === '' || flight.TSATSTR === 'STBY') {
      return false; // Exclude rows with blank or 'STBY' in TSAT
    }

    const tsatTime = this.parseHHMM(flight.TSATSTR);
    const timeDiffTSAT = (now - tsatTime) / (1000 * 60); // Calculate time difference in minutes for TSAT
    
    // Normal window: from -120 minutes to 10 minutes
    const isInNormalWindow = timeDiffTSAT >= -120 && timeDiffTSAT <= 10;

    // Special cases for midnight crossover:
    // When current time is just after midnight and TSAT is before midnight
    const isCurrentAfterMidnight = timeDiffTSAT >= -1439 && timeDiffTSAT <= -1430;

    // When current time is just before midnight and TSAT is after midnight
    const isTSATAfterMidnight = timeDiffTSAT >= 1320 && timeDiffTSAT <= 1439;

    return isInNormalWindow || isCurrentAfterMidnight || isTSATAfterMidnight;
  });

  // Sort by TSAT
  return validFlights.sort((a, b) => {
    //const tsatTimeA = this.parseHHMM(a.TSATSTR);
    //const tsatTimeB = this.parseHHMM(b.TSATSTR);

    const now = new Date();
     // Calculate the difference in minutes between TSAT time and current time
     const adjustTimeDiff = (diff) => {
        if (diff < -120) {
            return diff + (24 * 60);
        } else if (diff > 120) {
            return diff - (24 * 60);
        }
        return diff;
    };

    const tsatTimeA = this.parseHHMM(a.TSATSTR);
    const diffA = (tsatTimeA - now) / (1000 * 60);
    const adjustedDiffA = adjustTimeDiff(diffA);

    const tsatTimeB = this.parseHHMM(b.TSATSTR);
    const diffB = (tsatTimeB - now) / (1000 * 60);
    const adjustedDiffB = adjustTimeDiff(diffB);

    // Now, sort based on the adjusted time difference
    return adjustedDiffA - adjustedDiffB;

    //return tsatTimeA - tsatTimeB;
  });
},

  },
  methods: {

    parseHHMM(timeStr) {
      //check valid data
      if (!timeStr) {
        return null;
      } 
      //check data match with format
      const match = timeStr.match(/\d{2}/g);
      if (!match) {
        return null;
      }
      // retun data in hhmm format
      const [hours, minutes] = match;
      const parsedDate = new Date();
      parsedDate.setHours(hours, minutes, 0, 0);

    return parsedDate;
},

    formatUTCDate(timeStr) {
      if (timeStr === '' || timeStr === 'STBY') {
    return ''; // Return empty string for blank or 'STBY' values
    }

    const [hours, minutes] = timeStr.match(/\d{2}/g);
    const utcHours = (parseInt(hours) - 7 + 24) % 24; // Subtract 7 hours and ensure it's within the valid range

    return `${utcHours.toString().padStart(2, '0')}${minutes}`;
},

    getTSATStyle(timeStr) {
      const now = new Date();
      const tsatTime = this.parseHHMM(timeStr);
      let timeDiffTSATColor = (now - tsatTime) / (1000 * 60); // Calculate time difference in minutes for TSAT
      
      // Special cases for midnight crossover:
      // If TSAT is after midnight but current time is before midnight
      if (timeDiffTSATColor >= 1320 && timeDiffTSATColor <= 1439) {
        timeDiffTSATColor -= 24 * 60;
      } 
      // If TSAT is before midnight but current time is after midnight
      else if (timeDiffTSATColor >= -1439 && timeDiffTSATColor <= -1320) {
        timeDiffTSATColor += 24 * 60;
      }

      // Define the background colors based on minute ranges
      let backgroundColor = 'transparent';
      let textColor = 'black'; // Default text color

      if (timeDiffTSATColor >= -5 && timeDiffTSATColor <= 4) {
        backgroundColor = 'hsl(150,82%,53%)'; //green TSAT is within the range of -5 to +4 minutes of current time
      } else if (timeDiffTSATColor > 4 && timeDiffTSATColor <= 5) {
        backgroundColor = 'hsl(44,100%,77%)'; //yellow TSAT is within the range of +4 to +5 minutes of current time
      } else if (timeDiffTSATColor > 5 && timeDiffTSATColor <= 10) {
        backgroundColor = 'hsl(348,86%,61%)'; //red TSAT is +5 minutes or more of current time
        textColor = 'white'; // Change text color to white
      }

      return {
        backgroundColor,color: textColor,
      };
    },

    getTSATWindow(timeStr, minutes) {
      const tsatTime = this.parseHHMM(timeStr);
      const windowTime = new Date(tsatTime);
      windowTime.setMinutes(windowTime.getMinutes() + minutes);
      return `${windowTime.getMinutes().toString().padStart(2, '0')}`;
    },

  },
  

};
</script>

<style>
/* Import and apply Bulma styles */
@import '~bulma/css/bulma.css';

/* Change bg-color blue , text white */
th{
  font-weight: bolder;
  font-size: 4.5vw;
  color: white !important;
  background-color: hsl(207, 61%, 53%);
}

/* Adjust font size/bold, reduce space gap between border line */
td{
  font-weight: bold;
  font-size: 5.5vw;
  line-height: 1;
}

/* Remove borders within the TSAT cell */
.tsat-cell {
  padding: 0;
  border: none;
}

/* Add custom styles for the TSAT window text */
.tsat-window {
  font-size: 75%;
  color: hsl(0, 0%, 86%);
}
</style>
