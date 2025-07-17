const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');

const UsuarioSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: [true, "El correo es obligatorio"],
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Correo inválido"]
        },
        password: {
            type: String,
            required: [true, "La contraseña es obligatoria"],
            select: false
        },
        tel: {
            type: Number,
            required: [true, "El telefono es obligatorio"]
        },
        rol: {
            type: String,
            enum: ['superadmin', 'admin', 'user'],
            default: 'user'
        },
        matricula: {
            type: String,
            required: function () {
                return this.rol === 'user';
            },
            trim: true,
            maxlength: 15,
        },
        grupo: {
            type: String,
            required: function () {
                return this.rol === 'user';
            },
            trim: true,
            maxlength: 10,
        },
        imagenes: [{
            url: String
        }]
    },
    { timestamps: true }
);


UsuarioSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});


UsuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



UsuarioSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
