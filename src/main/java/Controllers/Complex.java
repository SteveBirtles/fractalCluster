package Controllers;

class Complex {

    private double r;
    private double i;

    Complex(double real, double imaginary) {
        r = real;
        i = imaginary;
    }

    double getReal() {
        return r;
    }

    double getImaginary() {
        return i;
    }

    Complex square() {
        double realPart = Math.pow(r, 2) - Math.pow(i, 2);
        double imaginaryPart = r * i * 2;
        r = realPart;
        i = imaginaryPart;
        return this;
    }

    Complex plus(Complex c) {
        r += c.getReal();
        i += c.getImaginary();
        return this;
    }

}
