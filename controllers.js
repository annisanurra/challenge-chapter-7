const { users } = require("./model");
const utils = require("./utils");
const nodemailer = require("nodemailer");

module.exports = {
  register: async (req, res) => {
    try {
      const data = await users.create({
        data: {
          email: req.body.email,
          password: await utils.cryptPassword(req.body.password),
        },
      });

      // return res.status(201).json({
      //   data,
      // });
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "admin@gmail.com",
        to: req.body.email,
        subject: "Success Registrasi",
        html: "<p>Selamat, Akun telah berhasil dibuat</p>", 
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render("error");
        }

        return res.render("successRegis");
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      sdsd
      const user = await prisma.users.findUnique({
        where: {
          email,
        },
      });
  
      if (!user) {
        res.redirect('/?message=Email not found&status=false');
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        res.redirect('/?message=Email or password wrong&status=false');
      }
  
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET
      );
  
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30 * 1000,
      });
  
      res.redirect(`/dashboard`);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      const encrypt = await utils.cryptPassword(req.body.email);

      await users.update({
        data: {
          resetPasswordToken: encrypt,
        },
        where: {
          id: findUser.id,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "system@gmail.com",
        to: req.body.email,
        subject: "Reset Password",
        html: `<p>Reset Password <a href="http://localhost:3000/set-password/${encrypt}">Click Here</a></p>`, // Local host
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render("error");
        }

        return res.render("successReset");
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  setPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          resetPasswordToken: req.body.key,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      await users.update({
        data: {
          password: await utils.cryptPassword(req.body.password),
          resetPasswordToken: null,
        },
        where: {
          id: findUser.id,
        },
      });

      return res.render("successSet");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },
};
