<template>
   
    <div class="container max-width">
        <div class="clock" :class="color">
          <div class="hour">{{hours}}</div>
          <div class="dots">:</div>
          <div class="min">{{minutes}}</div>
          <div class="dots">:</div>
          <div class="secs">{{seconds}}</div>      
        </div> 
    </div>
    </template>
    
    <script>
    export default {
      name: 'DigitalClock',
      props: {
        color: {
          type: String,
          default: 'red'
        }
      },
      data () {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      },
      methods: {
        setTime () {
          setInterval(() => {
             // Get the current UTC time
            const utcDate = new Date();
        
            // Convert to UTC-7 by subtracting 7 hours
            //const mstDate = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000);

            this.hours = this.checkSingleDigit(utcDate.getUTCHours());
            this.minutes = this.checkSingleDigit(utcDate.getUTCMinutes());
            this.seconds = this.checkSingleDigit(utcDate.getUTCSeconds());
          }, 1000)
        },
        checkSingleDigit (digit) {
          return ('0' + digit).slice(-2)
        }
       
      },
      mounted () {
        this.setTime()
      }
    }
    
    </script>
    
    <style>

    /* Import and apply Bulma styles */
    @import '~bulma/css/bulma.css';

    

      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
        flex-direction: column;
      }
      @font-face {
        font-family: 'Digital-7';
        src: url('../assets/fonts/digital-7.ttf') format('truetype');
        }

        .hour, .min, .secs, .dots {
        font-family: 'Digital-7', sans-serif;
        font-size: 7.5vw;
        font-weight: 500;
        line-height: 1.1;
        }
        
      .clock {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 1960px;
        height: auto;
        background: black;
        border-radius: 20px;
        color: red;
      }
     

    </style>
    