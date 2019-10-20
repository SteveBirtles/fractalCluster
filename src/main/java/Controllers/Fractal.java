package Controllers;

import javax.imageio.ImageIO;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Path("fractal/")
public class Fractal {

    public int intColor(int red, int green, int blue, int mode) {
        switch (mode) {
            case 1:
                return (red << 16) | (green << 8) | blue;
            case 2:
                return (red << 16) | (blue << 8) | green;
            case 3:
                return (green << 16) | (red << 8) | blue;
            case 4:
                return (green << 16) | (blue << 8) | red;
            case 5:
                return (blue << 16) | (red << 8) | green;
            case 6:
                return (blue << 16) | (green << 8) | red;
        }
        return 0;
    }

    public int getColor(double value, int mode) {
        if (mode == 0) {
            value /= 6;
            return ((int) (255 * value) << 16) | ((int) (255 * value) << 8) | (int) (255 * value);
        } else if (mode == 9) {
            value /= 6;
            return ((int) (255 * (1 - value)) << 16) | ((int) (255 * (1 - value)) << 8) | (int) (255 * (1 - value));
        } else if (mode == 8) {
            value /= 3;
            if (value < 1) {
                return ((int) (255 * value)) << 8 | 255;
            } else if (value < 2) {
                value -= 1;
                return ((int) (255 * (1 - value))) << 8 | ((int) (255 * (1 - value)));
            }
        } else if (mode == 7) {
            value /= 3;
            if (value < 1) {
                return 255 << 16 | ((int) (255 * value)) << 8;
            } else if (value < 2) {
                value -= 1;
                return ((int) (255 * (1 - value))) << 16 | ((int) (255 * (1 - value))) << 8;
            }
        } else if (mode < 7) {
            if (value < 1) {
                return intColor((int) (256 * value), 0, 255, mode);
            } else if (value < 2) {
                value -= 1;
                return intColor(255, (int) (255 * value), (int) (255 * (1 - value)), mode);
            } else if (value < 3) {
                value -= 2;
                return intColor((int) (255 * (1 - value)), 255, 0, mode);
            } else if (value < 4) {
                value -= 3;
                return intColor(0, 255, (int) (255 * value), mode);
            } else if (value < 5) {
                value -= 4;
                return intColor(0, (int) (255 * (1 - value)), 255, mode);
            } else {
                value -= 5;
                return intColor(0, 0, (int) (255 * (1 - value)), mode);
            }
        }
        return 0;
    }

    @GET
    @Path("generate")
    @Produces({"image/png"})
    public byte[] generateFractal(@QueryParam("x") Double x,
                                  @QueryParam("y") Double y,
                                  @QueryParam("w") Double w,
                                  @QueryParam("h") Double h,
                                  @QueryParam("xStep") Integer xStep,
                                  @QueryParam("yStep") Integer yStep,
                                  @QueryParam("max") Integer maxDepth,
                                  @QueryParam("mode") Integer mode,
                                  @QueryParam("power") Integer power,
                                  @QueryParam("julia") Boolean julia,
                                  @QueryParam("xj") Double xj,
                                  @QueryParam("yj") Double yj,
                                  @QueryParam("res") Integer res) {

        if (x == null) x = -1.0;
        if (y == null) y = -1.0;
        if (w == null) w = 2.0;
        if (h == null) h = 2.0;
        if (xStep == null) xStep = 128;
        if (yStep == null) yStep = 120;
        if (mode == null) mode = 1;
        if (power == null || power < 2) power = 2;
        if (maxDepth == null) maxDepth = 300;
        if (res == null) res = 1;
        if (julia == null) julia = false;

        if (julia && (xj == null || yj == null)) julia = false;

        System.out.println("Generating fractal segment: " +
                "x=" + x + ", " +
                "y=" + y + ", " +
                "w=" + w + ", " +
                "h=" + h + ", " +
                "depth=" + maxDepth + ", " +
                "xStep=" + xStep + ", " +
                "yStep=" + yStep + ", " +
                "power=" + power + ", " +
                "julia=" + julia + ", " +
                "xj=" + xj + ", " +
                "yj=" + yj + ", " +
                "mode=" + mode);

        BufferedImage fractalBuffer = new BufferedImage(xStep, yStep, BufferedImage.TYPE_INT_RGB);

        for (int i = 0; i < xStep; i += res) {
            for (int j = 0; j < yStep; j += res) {

                int depth = 0;
                boolean infinite = false;

                Complex c, z;

                if (julia) {
                    c = new Complex(xj, yj);
                    z = new Complex(x + ((double) i / xStep) * w, y + ((double) j / yStep) * h);
                } else {
                    c = new Complex(x + ((double) i / xStep) * w, y + ((double) j / yStep) * h);
                    z = new Complex(0, 0);
                }

                while (!infinite && depth < maxDepth) {
                    infinite = z.getReal() > 100000000 || z.getImaginary() > 100000000;
                    if (power == 2) {
                        z = (z.square()).plus(c);
                    } else {
                        z = (z.power(power)).plus(c);
                    }
                    depth++;
                }

                for (int p = i; p < i+res; p++) {
                    for (int q = j; q < j+res; q++) {
                        fractalBuffer.setRGB(p, q, getColor(6 * Math.abs((double) depth / (double) maxDepth), mode));
                    }
                }

            }
        }


        ByteArrayOutputStream fractalStream = new ByteArrayOutputStream();

        try {
            ImageIO.write(fractalBuffer, "png", fractalStream);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return fractalStream.toByteArray();

    }


}

