const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
  name: String,
  cnpj: String,
  cnae: String,
  address: String,
  distance: Number, // in meters
  coordinates: {
    lat: Number,
    lng: Number
  },
  source: {
    type: String,
    enum: ['receita_federal', 'openstreetmap'],
    required: true
  }
});

const demographicDataSchema = new mongoose.Schema({
  population: Number,
  averageIncome: Number,
  ageDistribution: {
    under18: Number,
    age18to35: Number,
    age36to55: Number,
    over55: Number
  },
  educationLevel: {
    elementary: Number,
    highSchool: Number,
    college: Number,
    graduate: Number
  }
});

const transportationSchema = new mongoose.Schema({
  busStops: [{
    name: String,
    distance: Number,
    coordinates: { lat: Number, lng: Number }
  }],
  subwayStations: [{
    name: String,
    distance: Number,
    coordinates: { lat: Number, lng: Number }
  }],
  mainRoads: [{
    name: String,
    distance: Number,
    type: String // highway, arterial, collector
  }]
});

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessType: {
    type: String,
    required: [true, 'Tipo de negócio é obrigatório']
  },
  cnae: {
    type: String,
    required: [true, 'CNAE é obrigatório']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Endereço é obrigatório']
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  searchRadius: {
    type: Number,
    default: 1000, // meters
    min: 100,
    max: 10000
  },
  competitors: {
    formal: [competitorSchema],
    informal: [competitorSchema],
    total: {
      type: Number,
      default: 0
    }
  },
  demographics: demographicDataSchema,
  transportation: transportationSchema,
  scores: {
    saturation: {
      value: {
        type: Number,
        min: 0,
        max: 100
      },
      level: {
        type: String,
        enum: ['baixa', 'média', 'alta', 'muito_alta']
      },
      description: String
    },
    opportunity: {
      value: {
        type: Number,
        min: 0,
        max: 100
      },
      level: {
        type: String,
        enum: ['baixa', 'média', 'alta', 'muito_alta']
      },
      description: String
    },
    final: {
      value: {
        type: Number,
        min: 0,
        max: 100
      },
      probability: String, // "62% de chance de sucesso"
      recommendation: String
    }
  },
  insights: [{
    type: {
      type: String,
      enum: ['warning', 'opportunity', 'suggestion', 'info']
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  alternativeLocations: [{
    address: String,
    coordinates: { lat: Number, lng: Number },
    distance: Number, // from original location
    reason: String,
    opportunityScore: Number
  }],
  relatedBusinesses: [{
    type: String,
    reason: String,
    successRate: Number
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  },
  processingTime: Number, // in milliseconds
  errorMessage: String
}, {
  timestamps: true
});

// Index for geospatial queries
analysisSchema.index({ 'location.coordinates': '2dsphere' });
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ businessType: 1, 'location.city': 1 });

// Calculate total competitors
analysisSchema.pre('save', function(next) {
  this.competitors.total = this.competitors.formal.length + this.competitors.informal.length;
  next();
});

// Method to get analysis summary
analysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    businessType: this.businessType,
    location: this.location.address,
    finalScore: this.scores.final.value,
    probability: this.scores.final.probability,
    competitorsCount: this.competitors.total,
    createdAt: this.createdAt,
    status: this.status
  };
};

module.exports = mongoose.model('Analysis', analysisSchema);
