import {
    addUserRateLimiting,
    getUserRateLimiting,
    modifyUserRateLimiting,
    deleteUserRateLimiting
} from '../controllers/ratelimiting.controller'
import auth from '../middelwares/auth.middelware'
import { Router } from 'express'


const router = Router()

router.post('/add', auth, addUserRateLimiting)
router.post('/get', auth, getUserRateLimiting)
router.post('/modify', auth, modifyUserRateLimiting)


export default router

