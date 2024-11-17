package com.answerdoorbell

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentResolver
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(savedInstanceState)
      createNotificationChannel()
  }
  private fun createNotificationChannel() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          try {
              val channelId = "sound_channel"
              val channelName = "RingABell"
              val importance = NotificationManager.IMPORTANCE_HIGH
              val notificationChannel = NotificationChannel(channelId, channelName, importance)
              val sound = "android.resource://$packageName/${R.raw.ring_bell}"
              val soundUri = Uri.parse(sound)
              
              val audioAttributes = AudioAttributes.Builder()
                  .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                  .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                  .build()
              notificationChannel.setSound(soundUri, audioAttributes)
              
              val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
              notificationManager.createNotificationChannel(notificationChannel)
              Log.d("MainActivity", "Created channel with sound: $sound")
          } catch (e: Exception) {
              Log.e("MainActivity", "Error creating notification channel", e)
              e.printStackTrace()
          }
      }
}

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "AnswerDoorBell"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
