var GO = function(hg) {
    // size of each chromosome
    // hg19
    // http://www.ncbi.nlm.nih.gov/projects/genome/assembly/grc/human/data/index.shtml
    hg = hg || [0, 249250621, 243199373, 198022430, 191154276, 180915260,
       171115067, 159138663, 146364022, 141213431, 135534747, 135006516,
       133851895, 115169878, 107349540, 102531392, 90354753, 81195210,
       78077248, 59128983, 63025520, 48129895, 51304566, 155270560, 59373566];

    if (hg.length !== 0 && hg[0] !== 0) {
        throw {
            name: 'Error',
                message: 'start your hg list with a 0, e.g. hg = [0, 249250621, \
                    243199373, 198022430, ...]'
        }
    } if (hg.length !== 25) {
        throw {
            name: 'Error',
                message: 'there should be 25 chr lengths in your hg'
        }
    }

    // returns a closure
    return (function() {

        // local variables
        // dimensions of the GO SVG element
        var width = 1200,
            height = 100,
            axis_height = 50,
            tick_size = 10,
            margin = {right : 10 };

        // length of genome
        // in bp
        var genomeLength = (function() {
                var length = 0;
                hg.forEach(function(i) {
                    length += i;
                });

                return length;
            })();

        var that = {        // return object
            getHg : function() { return hg; },

            // returns an array with each chromosome breakpoint on the genome
            // in bp
            computeChrTicks : function() {
                var ticks = [],        // the first tick is at 0
                prev = 0;
                hg.forEach(function(i) {
                    prev += i;
                    ticks.push(prev);
                });

                return ticks;
            },

            // scale : genome -> chart size
            scale_chr : d3.scale.linear()
                .domain([0, genomeLength])     // todo: this is messed up
                .range([0, width]),

            genome_axis : function(where) {
                var svg = where.append('svg')
                    .attr('class', 'genome-overview')
                    .attr('width', width + margin.right)
                    .attr('height', height);
                // ... more visual niceties: padding, etc.

                // genome axis
                svg.append('g')
                    .attr('class', 'genome-axis')
                    .append('line')
                    .attr('x1', 0)
                    .attr('y1', axis_height)
                    .attr('x2', width)
                    .attr('y2', axis_height);

                // chr ticks
                var chr_ticks = that.computeChrTicks().map(that.scale_chr);

                d3.select('.genome-axis')
                    .selectAll('.chr-tick')
                    .data(chr_ticks)
                    .enter()
                    .append('line')
                    .attr('class', 'chr-tick')
                    .attr('x1', function(d) { return d;})
                    .attr('y1', axis_height)
                    .attr('x2', function(d) { return d;})
                    .attr('y2', height - 60);


                var tickNum_to_chrName = function(tick) {
                    // assuming that the order is 1 ... 22 X Y
                    if (tick === 0) {
                        return '';
                    } if (tick === 23) {
                        return "X";
                    } if (tick === 24) {
                        return "Y";
                    } return tick;
                }

                // chr names
                d3.select('.genome-axis')
                    .selectAll('chr-name')
                    .data(chr_ticks)
                    .enter()
                    .append('text')
                    .attr('class', 'chr-name')
                    .attr('text-anchor', 'middle')
                    .text(function(d, i) { return tickNum_to_chrName(i)})
                    .attr('x', function(d, i) { return d - that.scale_chr(hg[i] / 2); })
                    .attr('y', function(d, i) {return height - 70 - i % 2 * 10;});

                return svg;
            },

            add : function(x,y) {
                return x + y;
            },

            gistic: function(cancer_type,genome_axis) {
                    var json_str = 'Gistic.json?selected_cancer_type=' + cancer_type;

                    d3.json(json_str, function(gistics) {
                        genome_axis.selectAll('gistic-roi')
                            .data(gistics)
                            .enter()
                            .append('rect')
                            .attr('class', 'gistic-roi')
                            .attr('width', function(d) {
                                console.log('roi size')
                                console.log(d.peakEnd - d.peakStart);
                                return that.scale_chr(d.peakEnd - d.peakStart);
                            })
                            .attr('height', 25)
                            .attr('x', function(d) {
                                return that.scale_chr(hg.slice(0, d.chromosome)
                                    .reduce(that.add,0)
                                    + d.peakStart);
                            })
                            .attr('y', 65)
                            .attr('fill', function(d) {
                                return d.ampdel ? 'red' : 'blue';
                            });
                    });
            }
        };

        return that;
    })();
};
