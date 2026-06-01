<!-- From Uiverse.io by Yaseen549 --> 
<div class="cyber-loader-container">
  <div class="plasma-vial">
    <div class="fluid-chamber">
      <div class="plasma-pool bottom-pool"></div>
      <div class="plasma-pool top-pool"></div>
      <div class="droplet d-1"></div>
      <div class="droplet d-2"></div>
      <div class="droplet d-3"></div>
      <div class="droplet d-4"></div>
      <div class="droplet d-5"></div>
    </div>
  </div>
  <!-- <div class="vial-base"></div> -->
</div>


<style>
    .cyber-loader-container {
        position         : relative;
        display          : flex;
        flex-direction   : column;
        align-items      : center;
        /* Ambient environmental glow */
        filter           : drop-shadow( 0 0 35px color-mix( in srgb, var( --color-brand-bright ) 15%, transparent ) );
    }

    .plasma-vial {
        --neon-cyan      : var( --color-brand-bright );
        --neon-blue      : var( --color-brand-dark );
        position         : relative;
        width            : 80px;
        height           : 200px;
        border-radius    : 40px;
        background       : linear-gradient( 180deg, color-mix( in srgb, var( --color-input ) 70%, transparent ) 0%, color-mix( in srgb, var( --color-input ) 90%, transparent ) 100% );
        border           : 2px solid color-mix( in srgb, var( --color-brand-bright ) 15%, transparent );
        box-shadow       :
            0 0 20px 0 color-mix( in srgb, var( --color-brand-bright ) 10%, transparent ),
            inset 0 0 25px color-mix( in srgb, var( --color-brand-dark ) 50%, transparent ),
            inset 0 -15px 30px color-mix( in srgb, var( --color-brand-bright ) 20%, transparent );
        overflow         : hidden;
        animation        : vial-pulse 4s ease-in-out infinite;
    }

    /* Thick glass structural illusion & inner shadows */
    .plasma-vial::after {
        content          : "";
        position         : absolute;
        inset            : 0;
        border-radius    : 40px;
        box-shadow       :
            inset -6px -6px 15px rgba( 0, 0, 0, 0.6 ),
            inset 6px 6px 15px rgba( 255, 255, 255, 0.25 );
        pointer-events   : none;
        z-index          : 10;
    }

    /* Curved specular highlight for 3D glass tube effect */
    .plasma-vial::before {
        content          : "";
        position         : absolute;
        top              : 10px;
        left             : 12px;
        width            : 12px;
        height           : 170px;
        background       : linear-gradient( 180deg, rgba( 255, 255, 255, 0.6 ) 0%, rgba( 255, 255, 255, 0 ) 80% );
        border-radius    : 10px;
        filter           : blur( 1px );
        pointer-events   : none;
        z-index          : 10;
    }

    /* Hardware base anchoring the vial */
    /* .vial-base {
        width            : 100px;
        height           : 20px;
        background       : linear-gradient( 90deg, #1a1c23, #2a2d38, #1a1c23 );
        border-radius    : 10px;
        margin-top       : -10px;
        z-index          : 20;
        box-shadow       :
            0 10px 20px rgba( 0, 0, 0, 0.8 ),
            inset 0 2px 2px rgba( 255, 255, 255, 0.1 ),
            0 -2px 10px color-mix( in srgb, var( --color-brand-bright ) 30%, transparent );
        border           : 1px solid #333;
    } */

    /* The gooey physics chamber */
    .fluid-chamber {
        position         : absolute;
        inset            : -10px; /* Slight overflow to hide edge artifacts from filter */
        /* SVG Matrix filter for the liquid merging effect + hue shift */
        filter           : url( 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="g"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>#g' );
        -webkit-filter   : url( 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="g"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>#g' );
        animation        : fluid-colors 6s ease-in-out infinite;
        z-index          : 1;
    }

    /* Shared properties for all liquid bodies */
    .plasma-pool,
    .droplet {
        position         : absolute;
        background       : linear-gradient( 180deg, var( --neon-cyan ) 10%, var( --neon-blue ) 90% );
        border-radius    : 50%;
    }

    /* Stationary fluid masses at top and bottom */
    .bottom-pool {
        width            : 100px;
        height           : 60px;
        bottom           : 0;
        left             : 0;
        border-radius    : 40% 60% 50% 50%;
        animation        : pool-shift 4s ease-in-out infinite alternate;
    }

    .top-pool {
        width            : 100px;
        height           : 40px;
        top              : 0;
        left             : 0;
        border-radius    : 50% 50% 60% 40%;
        opacity          : 0.8;
        animation        : pool-shift 3s ease-in-out infinite alternate-reverse;
    }

    /* Individual anti-gravity droplets */
    .droplet {
        bottom           : 20px;
    }

    .d-1 {
        width            : 35px;
        height           : 35px;
        left             : 15px;
        animation        : antigrav-flow 4s cubic-bezier( 0.4, 0.1, 0.3, 1 ) infinite;
    }

    .d-2 {
        width            : 45px;
        height           : 45px;
        left             : 35px;
        animation        : antigrav-flow 5.5s cubic-bezier( 0.5, 0.1, 0.2, 1 ) infinite 1.2s;
    }

    .d-3 {
        width            : 24px;
        height           : 24px;
        left             : 55px;
        animation        : antigrav-flow 3.8s cubic-bezier( 0.4, 0.2, 0.4, 1 ) infinite 0.7s;
    }

    .d-4 {
        width            : 28px;
        height           : 28px;
        left             : 25px;
        animation        : antigrav-flow 4.5s cubic-bezier( 0.3, 0.1, 0.4, 1 ) infinite 2.5s;
    }

    .d-5 {
        width            : 20px;
        height           : 20px;
        left             : 45px;
        animation        : antigrav-flow 3s cubic-bezier( 0.4, 0.1, 0.2, 1 ) infinite 3s;
    }

    /* --- KEYFRAMES --- */

    @keyframes antigrav-flow {
        0% {
            transform: translateY( 20px ) scale( 0.8 ) rotate( 0deg );
        }
        50% {
            transform: translateY( -170px ) scale( 1.15 ) rotate( 180deg );
        }
        100% {
            transform: translateY( 20px ) scale( 0.8 ) rotate( 360deg );
        }
    }

    @keyframes pool-shift {
        0% {
            transform: scaleX( 1 ) translateX( -5px );
        }
        100% {
            transform: scaleX( 1.1 ) translateX( 5px );
        }
    }

    @keyframes fluid-colors {
        0%,
        100% {
            filter: url( 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="g"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>#g' ) hue-rotate( 0deg );
        }
        50% {
            filter: url( 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="g"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></svg>#g' ) hue-rotate( -15deg );
        }
    }

    @keyframes vial-pulse {
        0%,
        100% {
            box-shadow:
                0 0 20px 0 color-mix( in srgb, var( --color-brand-bright ) 10%, transparent ),
                inset 0 0 25px color-mix( in srgb, var( --color-brand-dark ) 50%, transparent ),
                inset 0 -15px 30px color-mix( in srgb, var( --color-brand-bright ) 20%, transparent );
        }
        50% {
            box-shadow:
                0 0 35px 5px color-mix( in srgb, var( --color-brand-bright ) 25%, transparent ),
                inset 0 0 40px color-mix( in srgb, var( --color-brand-dark ) 70%, transparent ),
                inset 0 -20px 45px color-mix( in srgb, var( --color-brand-bright ) 40%, transparent );
        }
    }
</style>