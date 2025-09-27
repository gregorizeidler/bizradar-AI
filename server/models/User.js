const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  plan: {
    type: String,
    enum: ['individual', 'pro', 'enterprise'],
    default: 'individual'
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'trial'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
    },
    analysisCount: {
      type: Number,
      default: 0
    },
    analysisLimit: {
      type: Number,
      default: 3 // Trial limit
    }
  },
  profile: {
    company: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'pt-BR'
    }
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update analysis count
userSchema.methods.incrementAnalysisCount = function() {
  this.subscription.analysisCount += 1;
  return this.save();
};

// Check if user can perform analysis
userSchema.methods.canPerformAnalysis = function() {
  if (this.plan === 'pro' || this.plan === 'enterprise') {
    return true; // Unlimited for pro and enterprise
  }
  
  return this.subscription.analysisCount < this.subscription.analysisLimit;
};

// Get remaining analyses
userSchema.methods.getRemainingAnalyses = function() {
  if (this.plan === 'pro' || this.plan === 'enterprise') {
    return 'Ilimitado';
  }
  
  return Math.max(0, this.subscription.analysisLimit - this.subscription.analysisCount);
};

module.exports = mongoose.model('User', userSchema);
