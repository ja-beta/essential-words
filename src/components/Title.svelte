<h1 class="title">
    <span id="couple-first">
        <span class="tofrom">From</span>
        <span id="goat">
            <span id="g-g">G</span><span id="g-o">o</span><span id="g-a">a</span><span id="g-t">t</span>
        </span>
    </span>
    <span id="couple-second">
        <span class="tofrom">to</span>
        <span id="despite">Despite</span>
    </span>
</h1>

<style>
    .title{
        --title-word-gap: 1.25rem;
        --title-d-bg-p: 46%;
    }

    .title {
        width: 100%;
        max-width: var(--max-prose-width);
        display: flex;
        flex-direction: row;
        align-items: start;
        justify-content: space-between;
        text-transform: uppercase;
        font-family: var(--font-sans);
        line-height: 0.8;
        gap: var(--title-word-gap);
        box-sizing: border-box;
    }

    #couple-first, #couple-second{
        position: relative;
    }

    .tofrom{
        color: var(--color-primary);
        font-family: var(--font-sans);
        font-size: 35px;
        letter-spacing: 5%;
        font-weight: 400;
        position: absolute;
        top: 0;
        right: 100%;
        margin-right: var(--title-word-gap);

    }

    #goat, #despite{
        font-style: italic;
        font-size: 90px;
        font-weight: 200;
        padding: 0 1.2rem 0 0.75rem;
        color: var(--color-hero-headline);
        box-decoration-break: clone;
        background-repeat: no-repeat;
        background-size: 100% 0.9em;
    }

    

    #despite{
        letter-spacing: -1%;
        background-image: linear-gradient(var(--color-ngsl-highlight), var(--color-ngsl-highlight));
        background-position: 0 var(--title-d-bg-p); 
    }

    #goat{
        /* font-family: var(--font-serif); */
        font-family: 'Source Serif 4', serif; /* NOTE TO SELF: Figure this out. Maybe svg?*/
        background-image: linear-gradient(var(--color-gsl-highlight), var(--color-gsl-highlight));
        padding-left: 0.5rem;
        background-position: 0 calc(var(--title-d-bg-p) + 6.5%); 
    }

    #g-g{
        letter-spacing: -3%;
    }

    #g-o{
        letter-spacing: -8%;
    }

    #g-a{
        letter-spacing: -14%;
    }


    @media (max-width: 920px) {

        
        .title {
            --title-word-gap: clamp(0.5rem, 2.5vw, 1.25rem);
            --title-display-size: clamp(2rem, 10.5vw, 4rem);
            --title-meta-size: clamp(0.8125rem, 3.6vw, 1.75rem);
            width: auto;
            max-width: 100%;
        }

        #goat,
        #despite {
            font-size: var(--title-display-size);
            line-height: 1;
            padding: 0 clamp(0.35rem, 1.75vw, 1.2rem) 0 clamp(0.25rem, 1.25vw, 0.75rem);
        }

        .tofrom {
            font-size: var(--title-meta-size);
            position: relative;
            right: 0;
            margin-right: clamp(0.35rem, 1.5vw, var(--title-word-gap));
            flex-shrink: 0;
        }

        #couple-first,
        #couple-second {
            display: flex;
            align-items: flex-start;
            min-width: 0;
        }

        #goat,
        #despite {
            min-width: 0;
        }
    }

    @media (max-width: 420px) {
        .title {
            /* --title-display-size: clamp(2rem, 10.3vw, 2.75rem);
            --title-meta-size: clamp(0.95rem, 3.2vw, 1rem); */

            --title-display-size: 4.5rem;
            --title-meta-size: 1.25rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        #couple-first, #couple-second{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .tofrom {
            font-size: 1.25rem;
            position: relative;
            right: 0;
            margin-right: 0;
        }
    }

</style>