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

    public int intColor(int red, int green, int blue) {
        return (red << 16) | (green << 8) | blue;
    }

    public int getColor(double value) {
        if (value < 1) {

            return intColor((int) (256 * value), 0, 255);
        } else if (value < 2) {
            value -= 1;
            return intColor(255, (int) (255 * value), (int) (255 * (1 - value)));
        } else if (value < 3) {
            value -= 2;
            return intColor((int) (255 * (1 - value)), 255, 0);
        } else if (value < 4) {
            value -= 3;
            return intColor(0, 255, (int) (255 * value));
        } else if (value < 5) {
            value -= 4;
            return intColor(0, (int) (255 * (1 - value)), 255);
        } else {
            value -= 5;
            return intColor(0, 0, (int) (255 * (1 - value)));
        }
    }

    @GET
    @Path("generate")
    @Produces({"image/png"})
    public byte[] generateFractal(@QueryParam("x") Double x,
                                  @QueryParam("y") Double y,
                                  @QueryParam("w") Double w,
                                  @QueryParam("h") Double h,
                                  @QueryParam("size") Integer segmentSize,
                                  @QueryParam("max") Integer maxDepth) {

        if (x == null) x = -1.0;
        if (y == null) y = -1.0;
        if (w == null) w = 2.0;
        if (h == null) h = 2.0;
        if (segmentSize == null) segmentSize = 160;
        if (maxDepth == null) maxDepth = 300;

        System.out.println("Generating fractal segment: " +
                "x=" + x + ", " +
                "y=" + y + ", " +
                "w=" + w + ", " +
                "h=" + h + ", " +
                "depth=" + maxDepth + ", " +
                "size=" + segmentSize);

        BufferedImage fractalBuffer = new BufferedImage(segmentSize, segmentSize, BufferedImage.TYPE_INT_RGB);

        for (int i = 0; i < segmentSize; i++) {
            for (int j = 0; j < segmentSize; j++) {

                Complex c = new Complex(x + ((double) i / segmentSize) * w, y + ((double) j / segmentSize) * h);

                int depth = 0;
                boolean infinite = false;
                Complex z = new Complex(0, 0);

                while (!infinite && depth < maxDepth) {
                    infinite = z.getReal() > 100000000 || z.getImaginary() > 100000000;
                    z = (z.square()).plus(c);
                    depth++;
                }

                fractalBuffer.setRGB(i,j,getColor(6 * Math.abs((double) depth / (double) maxDepth)));

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

